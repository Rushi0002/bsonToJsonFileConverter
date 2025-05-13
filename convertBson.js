const bson = require("bson");
const fs = require("fs");

function convertBsonToJson(buffer, outputPath, callback) {
  const documents = [];
  let offset = 0;

  try {
    // Loop through BSON data and deserialize each document
    while (offset < buffer.length) {
      const docSize = buffer.readInt32LE(offset);
      const slice = buffer.slice(offset, offset + docSize);
      const doc = bson.deserialize(slice);

      // Convert ObjectId to extended JSON format
      if (doc._id && doc._id._bsontype === "ObjectId") {
        doc._id = { $oid: doc._id.toHexString() };
      }

      documents.push(doc);
      offset += docSize;
    }

    // Write the JSON array to a file
    fs.writeFile(outputPath, JSON.stringify(documents, null, 2), callback);
  } catch (err) {
    callback(err);
  }
}

module.exports = convertBsonToJson;
