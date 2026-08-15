export function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-IN")}`;
}
