const mockMenu = {
  data: {
    cards: [
      {},
      {},
      {
        groupedCard: {
          cardGroupMap: {
            REGULAR: {
              cards: [
                {
                  card: {
                    card: {
                      "@type":
                        "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory",
                      title: "Recommended",
                      itemCards: [
                        {
                          card: {
                            info: {
                              id: "1",
                              name: "Chicken Biryani",
                              price: 24900,
                            },
                          },
                        },
                        {
                          card: {
                            info: {
                              id: "2",
                              name: "Paneer Butter Masala",
                              price: 19900,
                            },
                          },
                        },
                      ],
                    },
                  },
                },
                {
                  card: {
                    card: {
                      "@type":
                        "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory",
                      title: "Starters",
                      itemCards: [
                        {
                          card: {
                            info: {
                              id: "3",
                              name: "Chicken Wings",
                              price: 14900,
                            },
                          },
                        },
                        {
                          card: {
                            info: {
                              id: "4",
                              name: "Veg Spring Rolls",
                              price: 12900,
                            },
                          },
                        },
                        {
                          card: {
                            info: {
                              id: "5",
                              name: "French Fries",
                              price: 9900,
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
};

export default mockMenu;