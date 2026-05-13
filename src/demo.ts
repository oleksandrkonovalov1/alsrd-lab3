import { BinarySearchTree } from "./bst.ts";

export function demo(): void {
  console.log("=== Двійкове дерево пошуку (BST) ===\n");

  const bst = new BinarySearchTree();
  const values = [50, 30, 70, 20, 40, 60, 80, 10, 25];

  console.log("Додавання ключів:");
  for (const v of values) {
    bst.insert(v);
    console.log(`  insert(${v})`);
  }

  console.log("\nВсі ключі дерева (in-order обхід):");
  bst.inOrderPrint();

  console.log("\nПошук ключів:");
  for (const key of [40, 25, 99]) {
    const result = bst.search(key);
    console.log(`  search(${key}) → ${result ? `знайдено (key=${result.key})` : "не знайдено"}`);
  }
}
