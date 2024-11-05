// saleService.js
const Sale = require('../models/saleModel');
const SalesDetail = require('../models/salesDetailModel');

const getSalesReport = async () => {
  const sales = await Sale.findAll({ include: [SalesDetail] });
  
  return sales.map(sale => {
    const salesDetail = sale.salesDetails[0]; // Assuming there's at least one sales detail
    const product = salesDetail.Product; // Assuming you have associated the Product model

    const price = product.price;
    const quantity = sale.quantitySold;
    const revenue = price * quantity;
    const commission = revenue * (sale.commissionRate / 100);
    const settlementAmount = revenue - commission;

    return {
      channel: sale.channel,
      createdAt: sale.createdAt,
      quantitySold: quantity,
      price: price,
      revenue: revenue,
      commissionRate: sale.commissionRate,
      commission: commission,
      settlementAmount: settlementAmount,
      productName: product.productName,
    };
  });
};

module.exports = {
  getSalesReport,
};
