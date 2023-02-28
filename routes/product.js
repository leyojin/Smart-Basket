const express = require("express");
const productRouter = express.Router();
const Shop = require("../models/shop");
const http = require("http");
const url = require("url");
const qs = require("querystring");
const mongoose = require("mongoose");

productRouter.get("/products", async (req, res) => {
  try {
    const products = await Shop.find();
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const server = http.createServer(async (req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const data = qs.parse(body);
      const productName = data.dropdownMenu;
      const quantity = data.textField;

      // Find the shop in MongoDB and update the quantity of the specified product
      try {
        const shop = await Shop.findOneAndUpdate(
          { "product.name": productName },
          { $set: { "product.$.quantity": quantity } },
          { new: true }
        );
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(
          `Quantity for ${productName} in ${shop.name} has been updated to ${quantity}`
        );
      } catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error updating quantity");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

module.exports = productRouter;
