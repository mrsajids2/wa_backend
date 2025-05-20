// pagination 
exports.getOffset = (pageno, itemperpage) => {
  // Convert to integer or fallback to default
  let perPage = parseInt(itemperpage);
  perPage = isNaN(perPage) || perPage <= 0 ? 10 : perPage;
  let page = parseInt(pageno);
  page = isNaN(page) || page <= 0 ? 1 : page;
  const offset = (page - 1) * perPage;

  return [offset, perPage];
};
