const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

function readInventory() {
  const inventoryData = fs.readFileSync("./data/inventories.json");
  const parsedInventory = JSON.parse(inventoryData);
  return parsedInventory;
}

function writeInventory(data) {
  const stringifiedData = JSON.stringify(data);
  fs.writeFileSync("./data/inventories.json", stringifiedData);
}

function readWarehouses() {
  const warehousesData = fs.readFileSync("./data/warehouses.json");
  const parsedWarehouses = JSON.parse(warehousesData);
  return parsedWarehouses;
}

//This route returns the inventory items across all warehouses
router.get("/", (req, res) => {
  const inventories = readInventory();

  const inventoryArr = inventories.map((inventory) => {
    return{
      id: inventory.id,
      itemName: inventory.itemName,
      description: inventory.description,
      warehouseName: inventory.warehouseName,
      warehouseId: inventory.warehouseID,
      category: inventory.category,
      status: inventory.status,
      quantity: inventory.quantity 
    }
  })
  res.json(inventoryArr);
});
//This route returns the specific inventory item detail
router.get("/:id", (req, res) => {
  const allInventory = readInventory();

  const item = allInventory.find((inventory) => {
    return inventory.id === req.params.id;
  });

  if (!item) return res.status(404).send("Item NOT Found!");

  res.json(item);
});

//create new inventory item 
router.post("/", (req, res) => {
  let inventory = readInventory();
  let warehouses = readWarehouses();
  let foundWarehouse = warehouses.find(warehouse => req.body.warehouseName === warehouse.name)
  let  {
    warehouseName,
    itemName,
    description,
    category,
    status,
    quantity
  } = req.body

  if (!warehouseName) {
    return res.status(400).json({
      message: 'warehouseName is required',
    });
  }

  if (!itemName) {
    return res.status(400).json({
      message: 'itemName is required',
    });
  }

  if (!description) {
    return res.status(400).json({
      message: 'description is required',
    });
  }

  if (!category) {
    return res.status(400).json({
      message: 'category is required',
    });
  }

  if (!status) {
    return res.status(400).json({
      message: 'status is required',
    });
  }

  if (!quantity) {
    return res.status(400).json({
      message: 'quantity is required',
    });
  }

  let newItem = {
    id: uuidv4(),
    warehouseID: foundWarehouse.id,
    warehouseName,
    itemName,
    description,
    category,
    status,
    quantity
  }

  inventory.push(newItem);
  writeInventory(inventory);
  res.status(200).json(newItem);
})

router.get('/warehouses/:id', (req, res) => {
  const inventory = readInventory();
  const warehouseID = req.params.id;
  const warehouseInventory = inventory.filter((item) => item.warehouseID === warehouseID);
  console.log(warehouseInventory)
  if (!warehouseInventory) {
    return res.status(404).send('Warehouse is out of stock');
  }
  res.json(warehouseInventory)
})

module.exports = router;