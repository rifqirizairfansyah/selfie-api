require("dotenv").config();
const { logger } = require("@pptik/galileo");
const {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  getUnixTime
} = require("date-fns");
const id = require("date-fns/locale/id");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const PdfPrinter = require("pdfmake");
const { createConnection } = require("../database/mongo");
const Company = require("../models/company_model");
const ExportedReport = require("../models/exported_report_model");
const Report = require("../models/report_model");
const Unit = require("../models/unit_model");

async function main () {
  await createConnection();
  const fonts = {
    Roboto: {
      normal: path.join(
        process.env.BASE_PATH,
        "src/utils",
        "fonts/Roboto-Regular.ttf"
      )
    }
  };
  const printer = new PdfPrinter(fonts);
  const lastWeek = subWeeks(new Date(), 1);
  const startWeek = getUnixTime(startOfWeek(lastWeek, { weekStartsOn: 1 }));
  const endWeek = getUnixTime(endOfWeek(lastWeek, { weekStartsOn: 1 }));
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
      DESCRIPTION: true,
      IMAGE: true
    };
    const reports = await Report.find(
      {
        COMPANY: COMPANY_GUID,
        UNIT: NAME,
        TIMESTAMP: { $gte: startWeek, $lte: endWeek }
      },
      projection
    ).lean();
    logger.info(`${index++}. ${COMPANY_GUID} - ${NAME}`);
    if (reports.length !== 0) {
      const company = await Company.findOne({
        COMPANY_GUID
      });
      const date = `${format(startWeek * 1000, "yyyy-MM-dd", {
        timeZone: "Asia/Jakarta"
      })} - ${format(endWeek * 1000, "yyyy-MM-dd", {
        timeZone: "Asia/Jakarta"
      })}`;
      const filename = `Laporan ${company.COMPANY_NAME} - ${NAME.replace(
        "/",
        " "
      )} ${date}.pdf`;

      await ExportedReport.create({
        COMPANY_GUID,
        UNIT: NAME,
        DATE_START: startWeek * 1000,
        DATE_END: endWeek * 1000,
        FILENAME: filename
      });

      const header = ["No", "Nama", "Alamat", "Waktu", "Komentar", "Gambar"];
      const docDefinition = {
        pageSize: "A4",
        content: [
          date,
          `Instansi: ${company.COMPANY_NAME}`,
          `Unit: ${NAME}`,
          "\n\n",
          {
            table: {
              dontBreakRows: true,
              headerRows: 1,
              body: [
                header,
                ...reports.map((data, index) => {
                  data.DESCRIPTION = data.DESCRIPTION || "-";
                  return [
                    index + 1,
                    data.NAME,
                    data.ADDRESS,
                    format(data.TIMESTAMP * 1000, "dd LLLL yyyy HH:mm:ss", {
                      locale: id
                    }),
                    data.DESCRIPTION,
                    {
                      image: path.join(
                        process.env.IMAGE_PATH,
                        data.IMAGE.replace("data/kehadiran/image/", "").replace(
                          "data/kehadiran",
                          ""
                        )
                      ),
                      width: 100
                    }
                  ];
                })
              ]
            }
          }
        ]
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(
        fs.createWriteStream(path.join(process.env.EXPORT_DIR, filename))
      );
      pdfDoc.end();
    }
  }

  mongoose.disconnect();
}

main().catch((error) => console.log(error));
