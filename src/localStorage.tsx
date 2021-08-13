import { makeAutoObservable } from "mobx";

export interface Product {
  id: number; // 생성 Time
  name: string;
  company: string;
  unit: string;
  show: boolean;
}

export class ProductInventory {
  product: Product;
  requiredCount: number;
  remainCount: number;

  constructor(product: Product, requiredCount: number = 0, remainCount: number = 0) {
    this.product = product;
    this.requiredCount = requiredCount;
    this.remainCount = remainCount;
    makeAutoObservable(this);
  }
}

class LocalStorage {
  private _products: Product[] = [];
  public get products(): Product[] {
    return this._products;
  }

  private _productInventories: ProductInventory[] = [];
  public get productInventories(): ProductInventory[] {
    return this._productInventories;
  }

  private static KEY_PRODUCTS = "products";
  private static KEY_PRODUCT_INVENTORIES = "product_inventories";

  constructor() {
    const productsJson = window.localStorage.getItem(LocalStorage.KEY_PRODUCTS);
    if (productsJson) {
      try {
        const parsed = JSON.parse(productsJson) as Product[];
        this._products = parsed;
      } catch (error) {
        window.alert("등록 아이템을 불러오는 데 실패했습니다.\n등록 아이템이 초기화 됩니다.");
        return;
      }
    }
    const productInventoriesJson = window.localStorage.getItem(LocalStorage.KEY_PRODUCT_INVENTORIES);
    if (productInventoriesJson) {
      try {
        const parsed = JSON.parse(productInventoriesJson) as ProductInventory[];
        this._productInventories = parsed;
      } catch (error) {
        window.alert("등록 아이템을 불러오는 데 실패했습니다.\n등록 아이템이 초기화 됩니다.");
        return;
      }
    }
  }

  save() {
    this.filterProductInventories();
    window.localStorage.setItem(LocalStorage.KEY_PRODUCTS, JSON.stringify(this._products));
    window.localStorage.setItem(LocalStorage.KEY_PRODUCT_INVENTORIES, JSON.stringify(this._productInventories));
  }

  saveProducts(products: Product[]) {
    this._products = products;
    this.save();
  }

  saveProductInventories(productInventories: ProductInventory[]) {
    this._productInventories = productInventories;
    this.filterProductInventories();
    window.localStorage.setItem(LocalStorage.KEY_PRODUCT_INVENTORIES, JSON.stringify(this._productInventories));
  }

  filterProductInventories() {
    if (JSON.stringify(this._productInventories.map((item) => item.product)) !== JSON.stringify(this._products)) {
      const newInventory = this._products.map((product) => {
        const prevInventory = this._productInventories.find((inv) => inv.product.id === product.id);
        if (!prevInventory || JSON.stringify(product) !== JSON.stringify(prevInventory.product)) {
          const remainCount = prevInventory?.remainCount || 0;
          const requiredCount = prevInventory?.requiredCount || 0;
          return { product, remainCount, requiredCount };
        }
        return prevInventory;
      });
      this._productInventories = newInventory;
    }
  }
}

const localStorage = new LocalStorage();
export default localStorage;
