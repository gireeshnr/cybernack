export const applyFilters = (data, filters) => {
    return data.filter((item) =>
      Object.keys(filters).every((key) =>
        item[key].toString().toLowerCase().includes(filters[key].toLowerCase())
      )
    );
  };
  