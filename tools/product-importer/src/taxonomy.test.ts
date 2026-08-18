import assert from "node:assert/strict";
import test from "node:test";
import { classifyProduct, extractAttributes, styleGroupFromTitle } from "./taxonomy.ts";

test("maps source tags into controlled classification and collections", () => {
  const result = classifyProduct("Cuban Collar Shirt - Orange", [
    "REB-MEN", "REB-MEN TOP", "REB-MEN SHIRTS", "REB-MEN NEW IN", "REB-NEW ARRIVALS",
  ]);
  assert.deepEqual(result.classification.categoryPath, ["men", "tops", "shirt"]);
  assert.deepEqual(result.collections, ["men-new-in", "new-arrivals"]);
  assert.deepEqual(result.diagnostics, { warnings: [], unmappedTags: [] });
});

test("uses the title to resolve conflicting source product types and reports the conflict", () => {
  const result = classifyProduct("Reversible Zip Vest - Eggplant", [
    "RBC- MEN", "RBC- TOPS MEN", "RBC- OUTERWEAR MEN", "RBC- SHIRTS MEN",
  ]);
  assert.equal(result.classification.productType, "outerwear");
  assert.match(result.diagnostics.warnings[0], /Conflicting product types/);
});

test("classifies jeans more specifically than a trousers source tag", () => {
  const result = classifyProduct("Straight Jeans - Black", [
    "REB-MEN", "REB-MEN BOTTOMS", "REB-MEN TROUSERS",
  ]);
  assert.equal(result.classification.productType, "jeans");
  assert.deepEqual(result.classification.categoryPath, ["men", "bottoms", "jeans"]);
  assert.match(result.diagnostics.warnings[0], /overridden by title inference jeans/);
});

test("classifies women one-piece, tops, and collections independently", () => {
  const dress = classifyProduct("Dolman Sleeve Dress - Khaki", [
    "REB-WOMEN", "REB-WOMEN DRESSES", "REB-WOMEN MAXI DRESS", "REB-WOMEN NEW IN",
  ]);
  assert.deepEqual(dress.classification.categoryPath, ["women", "one-piece", "dress"]);
  assert.deepEqual(dress.collections, ["women-new-in"]);

  const blouse = classifyProduct("Drawstring Collar Blouse - Lime", [
    "RBC- WOMEN", "RBC- TOPS WOMEN", "RBC- BLOUSE WOMEN", "RBC- NEW IN WOMEN",
  ]);
  assert.deepEqual(blouse.classification.categoryPath, ["women", "tops", "blouse"]);

  const shortSleeveBlouse = classifyProduct("Short Sleeve Blouse - Denim", [
    "RBC- WOMEN", "RBC- TOPS WOMEN", "RBC- BLOUSE WOMEN",
  ]);
  assert.deepEqual(shortSleeveBlouse.classification.categoryPath, ["women", "tops", "blouse"]);

  const tank = classifyProduct("Multi-Coloured Striped Tank - Stripes Khaki Brown", [
    "RBC- WOMEN", "RBC- TOPS WOMEN",
  ]);
  assert.equal(tank.classification.productType, "top");
});

test("classifies kids apparel and unisex accessories", () => {
  const kids = classifyProduct("Floral Gathered Dress - Lime Floral", [
    "REB-KIDS", "REB-KIDS DRESSES", "REB-KIDS NEW IN", "REB-NEW ARRIVALS",
  ]);
  assert.deepEqual(kids.classification.categoryPath, ["kids", "one-piece", "dress"]);
  assert.deepEqual(kids.collections, ["kids-new-in", "new-arrivals"]);

  const bag = classifyProduct("Trapeze Tote Bag - Sand", ["RBC- ACCESSORIES", "RBC- BAGS"]);
  assert.deepEqual(bag.classification.categoryPath, ["unisex", "accessories", "bag"]);

  const womenHat = classifyProduct("Linen Baseball Cap - Black", ["RBC- WOMEN", "RBC- ACCESSORIES", "RBC- HATS"]);
  assert.deepEqual(womenHat.classification.categoryPath, ["women", "accessories", "hat"]);

  const mistaggedTop = classifyProduct("Striped Ruffle Hem Top - Mint Stripes", [
    "RBC- KIDS", "RBC- DRESSES KIDS", "RBC- TOPS KIDS",
  ]);
  assert.deepEqual(mistaggedTop.classification.categoryPath, ["kids", "tops", "top"]);

  const conflictingDress = classifyProduct("Ruffle Dress - Sunray", [
    "RBC- KIDS", "RBC- DRESSES KIDS", "RBC- TEES KIDS",
  ]);
  assert.equal(conflictingDress.classification.productType, "dress");
});

test("extracts normalized merchandising attributes", () => {
  assert.deepEqual(extractAttributes("Relaxed Linen Shirt - Burnt Orange", "<b>55%Linen 45%Cotton</b>"), {
    color: "burnt-orange", materials: ["linen", "cotton"], fit: "relaxed", styles: [],
  });
  assert.equal(styleGroupFromTitle("Relaxed Linen Shirt - Burnt Orange"), "relaxed-linen-shirt");
});
