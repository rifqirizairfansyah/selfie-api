require("dotenv").config();
const { logger } = require("@pptik/galileo");
const {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  getUnixTime,
  parseISO
} = require("date-fns");
const id = require("date-fns/locale/id");
const excel = require("exceljs");
const mongoose = require("mongoose");
const { join } = require("path");
const Company = require("../models/company_model");
const ExportedReport = require("../models/exported_report_model");
const Report = require("../models/report_model");
const Unit = require("../models/unit_model");
const { createConnection } = require("../database/mongo");

async function main() {
  await createConnection();
  const units = await Unit.find({
    IS_ACTIVE: true
  }).lean();
  let index = 1;
  for (const { COMPANY_GUID, NAME } of units) {
    const projection = {
      _id: false,
      NAME: true,
      TIMESTAMP: true,
      ADDRESS: true,
      DESCRIPTION: true
    };
    const lastMonth = subMonths(addMonths(new Date(), 1), 1);
    const startMonth = getUnixTime(startOfMonth(lastMonth));
    const endMonth = getUnixTime(endOfMonth(lastMonth));
    const reports = await Report.find(
      {
        COMPANY: COMPANY_GUID,
        UNIT: NAME,
        TIMESTAMP: { $gte: startMonth, $lte: endMonth }
      },
      projection
    ).lean();
    logger.info(`${index++}. ${COMPANY_GUID} - ${NAME}`);

    if (reports.length !== 0) {
      const company = await Company.findOne({
        COMPANY_GUID
      });
      const date = `${format(startMonth * 1000, "yyyy-MM-dd", {
        timeZone: "Asia/Jakarta"
      })} - ${format(endMonth * 1000, "yyyy-MM-dd", {
        timeZone: "Asia/Jakarta"
      })}`;
      const filename = `Laporan Bulanan ${
        company.COMPANY_NAME
      } - ${NAME.replace("/", " ")} ${date}.xlsx`;
      const workbook = new excel.Workbook();
      const sheet = workbook.addWorksheet("Laporan");

      const header = [
        {
          label: "No",
          key: "no"
        },
        {
          label: "Nama",
          key: "NAME"
        },
        {
          label: "Alamat",
          key: "ADDRESS"
        },
        {
          label: "Waktu",
          key: "TIMESTAMP"
        },
        {
          label: "Komentar",
          key: "DESCRIPTION"
        }
      ];

      sheet.addRows([
        [format(parseISO(date), "EEEE, dd LLLL yyyy", { locale: id })],
        ["Instansi", company.COMPANY_NAME],
        ["Unit", NAME],
        []
      ]);
      sheet
        .addRow(header.map(({ label }) => label))
        .eachCell((cell, number) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF5A9BD5" },
            bgColor: { argb: "FFFFFFFF" }
          };
          cell.font = {
            color: { argb: "FFFFFFFF" },
            bold: true
          };
        });
      sheet.getColumn(1).width = 10;
      sheet.getColumn(2).width = 25;
      sheet.getColumn(3).width = 60;
      sheet.getColumn(4).width = 18;
      sheet.getColumn(5).width = 40;

      reports.forEach((data, index) => {
        sheet.addRow([
          index + 1,
          ...header
            .filter((header) => header.key !== "no")
            .map(({ key }) => {
              if (key === "TIMESTAMP") {
                const timestamp =
                  String(data.TIMESTAMP).length === 10
                    ? data.TIMESTAMP * 1000
                    : data.TIMESTAMP;
                return format(timestamp, "dd LLLL yyyy HH:mm:ss", {
                  locale: id
                });
              }

              if (key === "DESCRIPTION") {
                return data.DESCRIPTION || "-";
              }

              return data[key];
            })
        ]);
      });

      await workbook.xlsx.writeFile(join(process.env.EXPORT_DIR, filename));

      await ExportedReport.create({
        COMPANY_GUID,
        UNIT: NAME,
        DATE_START: startMonth * 1000,
        DATE_END: endMonth * 1000,
        FILENAME: filename
      });
    }
  }

  mongoose.disconnect();
}

main().catch(console.log);
