export class TreeNode {
  key: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(key: number) {
    this.key = key;
  }
}

export class BinarySearchTree {
  root: TreeNode | null = null;

  insert(key: number): void {
    this.root = this.insertNode(this.root, key);
  }

  private insertNode(node: TreeNode | null, key: number): TreeNode {
    if (!node) return new TreeNode(key);
    if (key < node.key) {
      node.left = this.insertNode(node.left, key);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key);
    }
    return node;
  }

  search(key: number): TreeNode | null {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: TreeNode | null, key: number): TreeNode | null {
    if (!node || node.key === key) return node;
    if (key < node.key) return this.searchNode(node.left, key);
    return this.searchNode(node.right, key);
  }

  inOrderPrint(): void {
    const keys: number[] = [];
    this.inOrderTraversal(this.root, keys);
    console.log(`Ключі (in-order): ${keys.join(", ")}`);
  }

  private inOrderTraversal(node: TreeNode | null, keys: number[]): void {
    if (!node) return;
    this.inOrderTraversal(node.left, keys);
    keys.push(node.key);
    this.inOrderTraversal(node.right, keys);
  }
}
