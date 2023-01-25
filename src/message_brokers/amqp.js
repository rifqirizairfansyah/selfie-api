const amqp = require("amqplib");
const { amqpUrl } = require("../config");
const logger = require("../utils/logger");

let channel;

const connectToAmqp = async () => {
  try {
    const connection = await amqp.connect(amqpUrl);
    channel = await connection.createChannel();
  } catch (error) {
    logger.error(error);
  }
};

const getChannel = () => channel;

const publish = (routingKey, message) => {
  getChannel().publish("amq.topic", routingKey, Buffer.from(message, "utf-8"));
};

module.exports = {
  connectToAmqp,
  getChannel,
  publish
};
