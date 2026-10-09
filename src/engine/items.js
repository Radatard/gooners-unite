// Household items: a catalog of everyday things plus the code that builds their low-poly models.
// To add an item, add a line to CATALOG:  [id, name, shape, size, colors, labelText, description]
// Shapes: box carton jug bottle wine can jar tub spray tube bag roll knife scissors utensil plate bowl
//         mug glass fruit banana book clothes pile pizzabox dumbbell kettlebell weight ball teddy
//         toycar block flat duck plant candle shoe
(function () {
  const CATALOG = [
    // ---- fridge ----
    ['milk', 'Whole Milk', 'jug', [0.15, 0.26, 0.15], ['#f6f6f2', '#2f6fe0', '#2f6fe0'], 'MILK', '1 gallon of whole milk. Cold.'],
    ['milk_2pct', '2% Milk', 'jug', [0.15, 0.26, 0.15], ['#f6f6f2', '#e03a3a', '#e03a3a'], 'MILK 2%', 'Half full. Expires in 4 days.'],
    ['milk_expired', 'Milk (expired)', 'jug', [0.15, 0.26, 0.15], ['#eae6c8', '#2f6fe0', '#2f6fe0'], 'MILK', 'Expired 11 days ago. The jug is bloated.'],
    ['oatmilk', 'Oat Milk', 'carton', [0.09, 0.22, 0.07], ['#e9dcc0', '#3d2b1f'], 'OAT', 'Barista edition oat milk.'],
    ['eggs', 'Eggs (dozen)', 'box', [0.3, 0.07, 0.11], ['#d9d2c0', '#e8b23a', '#4a3a10'], 'EGGS', 'Large brown eggs. 9 left.'],
    ['butter', 'Butter', 'box', [0.13, 0.05, 0.065], ['#fff3b0', '#d63a2f'], 'BUTTER', 'Salted butter, 4 sticks.'],
    ['cheese', 'Cheddar Block', 'box', [0.12, 0.04, 0.07], ['#ffa62b', '#ffa62b', '#7a3d00'], 'CHEDDAR', 'Sharp cheddar, half used.'],
    ['cheese_slices', 'American Cheese Slices', 'box', [0.1, 0.03, 0.1], ['#ffcc33', '#2f6fe0'], 'SINGLES', '16 individually wrapped slices.'],
    ['string_cheese', 'String Cheese', 'bag', [0.14, 0.04, 0.1], ['#f2f0e6', '#e03a3a'], 'STRING', 'Kid snack. 6 sticks left.'],
    ['yogurt', 'Yogurt Cups', 'tub', [0.04, 0.08], ['#ffffff', '#ff6fa5', '#ff6fa5'], 'YOGURT', 'Strawberry yogurt.'],
    ['greek_yogurt', 'Greek Yogurt Tub', 'tub', [0.065, 0.11], ['#ffffff', '#1d4ed8', '#1d4ed8'], 'GREEK', 'Plain, 0% fat. 32 oz.'],
    ['oj', 'Orange Juice', 'carton', [0.1, 0.25, 0.08], ['#ffffff', '#ff8c1a'], 'O.J.', 'No pulp. Half gallon.'],
    ['apple_juice', 'Apple Juice', 'jug', [0.1, 0.24, 0.08], ['#e7b54a', '#c62828', '#c62828'], 'APPLE', '100% apple juice.'],
    ['juice_boxes', 'Juice Boxes', 'box', [0.16, 0.11, 0.08], ['#7ad15a', '#ff4d6d'], 'JUICE', 'Fruit punch juice boxes, 8 pack.'],
    ['ketchup', 'Ketchup', 'bottle', [0.035, 0.2], ['#d1261b', '#ffffff', '#ffffff'], 'KETCHUP', 'Squeeze bottle. Almost empty.'],
    ['mustard', 'Yellow Mustard', 'bottle', [0.03, 0.18], ['#ffd60a', '#d1261b', '#d1261b'], 'MUSTARD', 'Classic yellow mustard.'],
    ['mayo', 'Mayonnaise', 'jar', [0.05, 0.14], ['#f8f4e3', '#1d4ed8', '#1d4ed8'], 'MAYO', 'Real mayonnaise.'],
    ['ranch', 'Ranch Dressing', 'bottle', [0.035, 0.19], ['#f8f8f0', '#2e7d32', '#2e7d32'], 'RANCH', 'Buttermilk ranch.'],
    ['hot_sauce', 'Hot Sauce', 'bottle', [0.02, 0.15], ['#b71c1c', '#fff3e0', '#2e7d32'], 'HOT', 'Louisiana-style hot sauce.'],
    ['sriracha', 'Sriracha', 'bottle', [0.03, 0.2], ['#e53935', '#ffffff', '#2e7d32'], 'SRIRACHA', 'Hot chili sauce.'],
    ['soy_sauce', 'Soy Sauce', 'bottle', [0.025, 0.17], ['#2b1b10', '#d32f2f', '#d32f2f'], 'SOY', 'Low sodium soy sauce.'],
    ['pickles', 'Dill Pickles', 'jar', [0.05, 0.16], ['#9fbf4a', '#2e7d32', '#ffffff'], 'PICKLES', 'Kosher dill spears.'],
    ['jam', 'Strawberry Jam', 'jar', [0.04, 0.1], ['#b0172f', '#ffffff', '#c9b28a'], 'JAM', 'Strawberry preserves.'],
    ['salsa', 'Salsa', 'jar', [0.045, 0.12], ['#c0392b', '#f1c40f', '#c62828'], 'SALSA', 'Medium chunky salsa.'],
    ['hummus', 'Hummus', 'tub', [0.06, 0.06], ['#e6d3a3', '#2e7d32', '#2e7d32'], 'HUMMUS', 'Roasted garlic hummus.'],
    ['leftovers', 'Leftovers Container', 'box', [0.16, 0.07, 0.12], ['#e0f2f1', null], '', 'Last night\'s spaghetti, covered with plastic wrap.'],
    ['takeout', 'Takeout Box', 'box', [0.12, 0.09, 0.12], ['#ffffff', '#d32f2f'], 'THANK U', 'Half a carton of lo mein.'],
    ['moldy_takeout', 'Old Takeout', 'box', [0.12, 0.09, 0.12], ['#c9c8a0', '#6b8e23'], '???', 'Nobody remembers when this was ordered. It\'s fuzzy.'],
    ['lettuce', 'Head of Lettuce', 'fruit', [0.08], ['#7cc242'], '', 'Iceberg lettuce.'],
    ['carrots', 'Baby Carrots', 'bag', [0.14, 0.04, 0.2], ['#ff8f1f', '#2e7d32'], 'CARROTS', '1 lb bag of baby carrots.'],
    ['apple', 'Apple', 'fruit', [0.04], ['#d62828'], '', 'A red apple.'],
    ['orange', 'Orange', 'fruit', [0.04], ['#ff8c1a'], '', 'A navel orange.'],
    ['lemon', 'Lemon', 'fruit', [0.032], ['#ffe14d'], '', 'A lemon.'],
    ['tomato', 'Tomato', 'fruit', [0.035], ['#e63946'], '', 'A ripe tomato.'],
    ['onion', 'Onion', 'fruit', [0.04], ['#d9a066'], '', 'A yellow onion.'],
    ['avocado', 'Avocado', 'fruit', [0.04], ['#3b5d2e'], '', 'Perfectly ripe, for once.'],
    ['bananas', 'Bananas', 'banana', [0.18], ['#ffe135'], '', 'A bunch of bananas, a bit spotty.'],
    ['deli_turkey', 'Sliced Turkey', 'box', [0.15, 0.04, 0.12], ['#f0e0d0', '#1565c0'], 'TURKEY', 'Oven-roasted deli turkey.'],
    ['hot_dogs', 'Hot Dogs', 'box', [0.18, 0.04, 0.08], ['#e74c3c', '#ffd60a', '#b71c1c'], 'FRANKS', 'Beef franks, 8 count.'],
    ['bacon', 'Bacon', 'box', [0.2, 0.025, 0.12], ['#d35d6e', '#ffffff', '#8b0000'], 'BACON', 'Thick cut bacon.'],
    ['chicken', 'Chicken Breasts', 'box', [0.22, 0.05, 0.16], ['#f7d7c4', '#1d4ed8'], 'CHICKEN', 'Boneless skinless, 2.4 lb.'],
    ['ground_beef', 'Ground Beef', 'box', [0.16, 0.05, 0.12], ['#b23a48', '#ffffff', '#b23a48'], 'BEEF', '80/20 ground beef. Use by tomorrow.'],
    ['beer', 'Beer Can', 'can', [0.033, 0.12], ['#c9d6e3', '#0d47a1'], 'LAGER', 'Cheap light lager.'],
    ['beer_bottle', 'Beer Bottle', 'wine', [0.03, 0.23], ['#6b3e10', '#f4e1b0', '#c9a227'], 'IPA', 'Local IPA.'],
    ['soda', 'Cola', 'can', [0.033, 0.12], ['#c8102e', '#ffffff'], 'COLA', 'Classic cola.'],
    ['lemon_soda', 'Lemon-Lime Soda', 'can', [0.033, 0.12], ['#2e9b3f', '#ffe14d'], 'LIME', 'Lemon-lime soda.'],
    ['energy', 'Energy Drink', 'can', [0.03, 0.16], ['#111111', '#7cff3a', '#7cff3a'], 'VOLT', '300mg caffeine. Probably not great.'],
    ['water_bottle', 'Water Bottle', 'bottle', [0.033, 0.21], ['#bfe6ff', '#1e88e5', '#1e88e5'], 'WATER', 'Spring water, 16.9 oz.'],
    ['seltzer', 'Sparkling Water', 'can', [0.033, 0.12], ['#e0f7fa', '#ff6f91'], 'FIZZ', 'Grapefruit sparkling water.'],
    ['protein_shake', 'Protein Shake', 'bottle', [0.035, 0.18], ['#3d2b1f', '#ffffff', '#3d2b1f'], 'PROTEIN', '30g protein, chocolate.'],
    ['wine', 'White Wine', 'wine', [0.038, 0.3], ['#c8d96f', '#ffffff', '#8a1c1c'], 'WINE', 'Pinot grigio, opened, cork shoved back in.'],
    ['red_wine', 'Red Wine', 'wine', [0.038, 0.3], ['#3b0a14', '#f4e1b0', '#3b0a14'], 'CABERNET', 'Cabernet sauvignon.'],
    ['baby_food', 'Applesauce Pouches', 'box', [0.12, 0.1, 0.06], ['#9ad15a', '#ff4d6d'], 'APPLE', 'Squeeze pouches for lunchboxes.'],
    ['ice_tray', 'Ice Cube Tray', 'box', [0.25, 0.04, 0.11], ['#d9f2ff', null], '', 'Half full of ice.'],
    ['frozen_pizza', 'Frozen Pizza', 'box', [0.28, 0.04, 0.28], ['#c62828', '#ffd60a', '#c62828'], 'PIZZA', 'Pepperoni, rising crust.'],
    ['ice_cream', 'Ice Cream', 'tub', [0.07, 0.13], ['#f5e1c8', '#5d2e0f', '#5d2e0f'], 'CHOC', 'Chocolate fudge brownie. Freezer burned.'],
    ['frozen_peas', 'Frozen Peas', 'bag', [0.16, 0.04, 0.22], ['#6abf4b', '#1d4ed8'], 'PEAS', 'Also used as an ice pack.'],
    ['nuggets', 'Chicken Nuggets', 'bag', [0.2, 0.06, 0.26], ['#ffb703', '#c62828'], 'NUGGETS', 'Dino-shaped chicken nuggets.'],
    ['popsicles', 'Popsicles', 'box', [0.2, 0.06, 0.12], ['#ff4d6d', '#3a86ff'], 'POPS', 'Assorted fruit pops.'],
    ['frozen_burrito', 'Frozen Burritos', 'box', [0.2, 0.06, 0.14], ['#ffcc80', '#6d4c41'], 'BURRITO', 'Bean & cheese, 8 pack.'],
    ['meal_prep', 'Meal Prep Container', 'box', [0.18, 0.06, 0.13], ['#1f1f1f', '#1f1f1f', '#ffffff'], 'MEAL', 'Chicken, rice and broccoli. Same as yesterday.'],

    // ---- pantry ----
    ['cereal', 'Choco Puffs Cereal', 'box', [0.2, 0.3, 0.07], ['#6d3b1f', '#ffd60a', '#6d3b1f'], 'CHOCO', 'Kids\' chocolate cereal. Mostly crumbs.'],
    ['cereal_bran', 'Bran Flakes', 'box', [0.2, 0.3, 0.07], ['#d9a066', '#1d4ed8'], 'BRAN', 'High fiber bran flakes.'],
    ['oatmeal', 'Oatmeal', 'tub', [0.065, 0.2], ['#d9c09a', '#1d4ed8', '#c62828'], 'OATS', 'Old fashioned rolled oats.'],
    ['pasta', 'Spaghetti', 'box', [0.27, 0.05, 0.07], ['#1d4ed8', '#ffffff', '#1d4ed8'], 'PASTA', '1 lb spaghetti.'],
    ['penne', 'Penne', 'box', [0.15, 0.2, 0.07], ['#1d4ed8', '#ffd60a', '#1d4ed8'], 'PENNE', 'Penne rigate.'],
    ['rice', 'Rice', 'bag', [0.18, 0.26, 0.08], ['#ffffff', '#c62828'], 'RICE', '5 lb long grain white rice.'],
    ['flour', 'Flour', 'bag', [0.16, 0.26, 0.1], ['#f5f0e6', '#1d4ed8'], 'FLOUR', 'All-purpose flour.'],
    ['sugar', 'Sugar', 'bag', [0.14, 0.22, 0.09], ['#ffffff', '#1d4ed8'], 'SUGAR', 'Granulated sugar.'],
    ['brown_sugar', 'Brown Sugar', 'bag', [0.12, 0.18, 0.07], ['#8d5524', '#ffffff', '#3d2b1f'], 'BROWN', 'Light brown sugar. Rock hard.'],
    ['peanut_butter', 'Peanut Butter', 'jar', [0.05, 0.13], ['#b5651d', '#1d4ed8', '#c62828'], 'PEANUT', 'Creamy peanut butter.'],
    ['soup', 'Chicken Noodle Soup', 'can', [0.038, 0.1], ['#c62828', '#ffffff', '#c62828'], 'SOUP', 'Condensed chicken noodle soup.'],
    ['beans', 'Black Beans', 'can', [0.038, 0.11], ['#2b2b2b', '#ffd60a', '#2b2b2b'], 'BEANS', 'Canned black beans.'],
    ['tomatoes_can', 'Diced Tomatoes', 'can', [0.038, 0.11], ['#c62828', '#2e7d32'], 'TOMATO', 'Canned diced tomatoes.'],
    ['tuna', 'Canned Tuna', 'can', [0.04, 0.04], ['#1d4ed8', '#ffd60a', '#1d4ed8'], 'TUNA', 'Chunk light tuna in water.'],
    ['bread', 'Loaf of Bread', 'bag', [0.13, 0.13, 0.28], ['#f5deb3', '#ffd60a', '#c62828'], 'BREAD', 'Whole wheat sandwich bread.'],
    ['moldy_bread', 'Moldy Bread', 'bag', [0.13, 0.13, 0.28], ['#a8b88a', '#ffd60a', '#556b2f'], 'BREAD', 'Green spots on every slice. Throw it out.'],
    ['chips', 'Potato Chips', 'bag', [0.2, 0.28, 0.08], ['#ffd60a', '#c62828'], 'CHIPS', 'Family size, mostly air.'],
    ['tortilla_chips', 'Tortilla Chips', 'bag', [0.2, 0.28, 0.08], ['#ff8f1f', '#2e7d32'], 'TORTILLA', 'Restaurant style.'],
    ['crackers', 'Crackers', 'box', [0.2, 0.2, 0.05], ['#c62828', '#ffd60a', '#c62828'], 'CRACKER', 'Buttery round crackers.'],
    ['goldfish', 'Cheddar Fish Crackers', 'bag', [0.15, 0.2, 0.06], ['#ff8f1f', '#1d4ed8'], 'FISHIES', 'The snack that smiles back.'],
    ['ramen', 'Instant Ramen', 'bag', [0.12, 0.03, 0.1], ['#ffd60a', '#c62828'], 'RAMEN', 'Chicken flavor. 25 cents of dinner.'],
    ['cup_noodles', 'Cup Noodles', 'tub', [0.045, 0.1], ['#ffffff', '#c62828', '#c62828'], 'NOODLE', 'Just add hot water.'],
    ['granola_bars', 'Granola Bars', 'box', [0.18, 0.12, 0.06], ['#2e7d32', '#ffd60a'], 'GRANOLA', 'Oats & honey, 12 bars.'],
    ['olive_oil', 'Olive Oil', 'wine', [0.035, 0.28], ['#556b2f', '#f4e1b0', '#2e2e2e'], 'OLIVE', 'Extra virgin olive oil.'],
    ['veg_oil', 'Vegetable Oil', 'bottle', [0.05, 0.28], ['#ffd54f', '#d32f2f', '#d32f2f'], 'OIL', '48 oz vegetable oil.'],
    ['vinegar', 'White Vinegar', 'bottle', [0.045, 0.25], ['#f2f7fa', '#1d4ed8', '#1d4ed8'], 'VINEGAR', 'Distilled white vinegar. Also cleans everything.'],
    ['honey', 'Honey Bear', 'bottle', [0.035, 0.13], ['#e0a526', '#ffd60a', '#ffd60a'], 'HONEY', 'Squeeze bear of clover honey.'],
    ['coffee', 'Ground Coffee', 'tub', [0.07, 0.17], ['#c62828', '#1f1f1f', '#1f1f1f'], 'COFFEE', 'Medium roast ground coffee.'],
    ['tea', 'Black Tea', 'box', [0.13, 0.07, 0.07], ['#2e7d32', '#ffd60a'], 'TEA', '100 tea bags.'],
    ['chamomile', 'Chamomile Tea', 'box', [0.13, 0.07, 0.07], ['#ffeb99', '#8e7cc3'], 'CALM', 'Sleepytime chamomile.'],
    ['mac_cheese', 'Mac & Cheese', 'box', [0.15, 0.1, 0.05], ['#1d4ed8', '#ff8f1f'], 'MAC', 'Blue box mac & cheese.'],
    ['popcorn', 'Microwave Popcorn', 'box', [0.15, 0.12, 0.08], ['#ffd60a', '#c62828'], 'POPCORN', 'Movie theater butter.'],
    ['cookies', 'Chocolate Chip Cookies', 'bag', [0.2, 0.06, 0.12], ['#1d4ed8', '#8d5524'], 'COOKIES', 'Hidden behind the bran flakes.'],
    ['baking_soda', 'Baking Soda', 'box', [0.1, 0.12, 0.06], ['#ff8f1f', '#ffd60a', '#c62828'], 'SODA', 'Baking soda.'],
    ['protein_powder', 'Whey Protein', 'tub', [0.09, 0.24], ['#111111', '#d4af37', '#111111'], 'WHEY', '5 lb double rich chocolate.'],
    ['preworkout', 'Pre-Workout', 'tub', [0.05, 0.11], ['#ff1744', '#111111', '#111111'], 'PRE', 'Blue raspberry. Makes your face tingle.'],
    ['creatine', 'Creatine', 'tub', [0.05, 0.1], ['#ffffff', '#1d4ed8', '#1d4ed8'], 'CREATINE', 'Creatine monohydrate.'],
    ['rice_cakes', 'Rice Cakes', 'bag', [0.1, 0.18, 0.1], ['#f5f0e6', '#2e7d32'], 'RICE CK', 'Lightly salted.'],
    ['oats_bulk', 'Bulk Oats', 'bag', [0.2, 0.3, 0.12], ['#d9c09a', '#2e7d32'], 'OATS', '10 lb bag of oats.'],
    ['crisco', 'Shortening', 'tub', [0.07, 0.12], ['#ffffff', '#1d4ed8', '#1d4ed8'], 'SHORT', 'All-vegetable shortening.'],
    ['cat_food', 'Cat Food Cans', 'can', [0.035, 0.035], ['#7e57c2', '#ffffff'], 'MEOW', 'Salmon pate. Biscuit\'s favorite.'],
    ['cat_kibble', 'Cat Kibble', 'bag', [0.2, 0.3, 0.1], ['#7e57c2', '#ffd60a'], 'KITTY', 'Indoor formula cat food.'],
    ['prune_juice', 'Prune Juice', 'bottle', [0.045, 0.24], ['#3b0a14', '#ffffff', '#ffffff'], 'PRUNE', 'For regularity.'],

    // ---- spices ----
    ['salt', 'Salt', 'tub', [0.04, 0.14], ['#1d4ed8', '#ffffff', '#ffffff'], 'SALT', 'Iodized table salt.'],
    ['pepper', 'Black Pepper', 'jar', [0.025, 0.11], ['#2b2b2b', '#c62828', '#c62828'], 'PEPPER', 'Ground black pepper.'],
    ['pepper_grinder', 'Pepper Grinder', 'bottle', [0.025, 0.16], ['#4e342e', null, '#4e342e'], '', 'Wooden pepper mill.'],
    ['garlic_powder', 'Garlic Powder', 'jar', [0.025, 0.1], ['#f2e6c9', '#c62828', '#c62828'], 'GARLIC', 'Garlic powder.'],
    ['onion_powder', 'Onion Powder', 'jar', [0.025, 0.1], ['#f2e6c9', '#7b1fa2', '#c62828'], 'ONION', 'Onion powder.'],
    ['paprika', 'Paprika', 'jar', [0.025, 0.1], ['#c1440e', '#ffffff', '#c62828'], 'PAPRIKA', 'Smoked paprika.'],
    ['cumin', 'Ground Cumin', 'jar', [0.025, 0.1], ['#a0662a', '#ffffff', '#c62828'], 'CUMIN', 'Ground cumin.'],
    ['chili_powder', 'Chili Powder', 'jar', [0.025, 0.1], ['#9b2915', '#ffffff', '#c62828'], 'CHILI', 'Chili powder.'],
    ['oregano', 'Oregano', 'jar', [0.025, 0.1], ['#5a7d2c', '#ffffff', '#c62828'], 'OREGANO', 'Dried oregano leaves.'],
    ['basil', 'Basil', 'jar', [0.025, 0.1], ['#4a7c2c', '#ffffff', '#c62828'], 'BASIL', 'Dried basil.'],
    ['cinnamon', 'Cinnamon', 'jar', [0.025, 0.1], ['#7b4a1e', '#ffffff', '#c62828'], 'CINNAMON', 'Ground cinnamon.'],
    ['nutmeg', 'Nutmeg', 'jar', [0.025, 0.09], ['#8d5524', '#ffffff', '#c62828'], 'NUTMEG', 'Ground nutmeg. Used once a year.'],
    ['bay_leaves', 'Bay Leaves', 'jar', [0.025, 0.1], ['#7f8f3a', '#ffffff', '#c62828'], 'BAY', 'Whole bay leaves.'],
    ['cayenne', 'Cayenne Pepper', 'jar', [0.025, 0.1], ['#c62828', '#ffffff', '#c62828'], 'CAYENNE', 'Ground cayenne. Careful.'],
    ['italian', 'Italian Seasoning', 'jar', [0.025, 0.1], ['#6b8e23', '#2e7d32', '#c62828'], 'ITALIAN', 'Italian seasoning blend.'],
    ['curry', 'Curry Powder', 'jar', [0.025, 0.1], ['#e1a91a', '#ffffff', '#c62828'], 'CURRY', 'Madras curry powder.'],
    ['vanilla', 'Vanilla Extract', 'bottle', [0.018, 0.1], ['#3e2723', '#ffffff', '#1f1f1f'], 'VANILLA', 'Pure vanilla extract.'],
    ['season_salt', 'Seasoned Salt', 'jar', [0.03, 0.12], ['#ffcc33', '#c62828', '#c62828'], 'SEASON', 'Seasoned salt.'],
    ['msg', 'MSG', 'jar', [0.028, 0.1], ['#ffffff', '#c62828', '#c62828'], 'MSG', 'Flavor enhancer.'],
    ['red_pepper_flakes', 'Red Pepper Flakes', 'jar', [0.025, 0.1], ['#b71c1c', '#ffd60a', '#c62828'], 'FLAKES', 'Crushed red pepper. From a pizza place.'],
    ['everything_bagel', 'Everything Bagel Seasoning', 'jar', [0.028, 0.1], ['#2b2b2b', '#ffffff', '#c62828'], 'BAGEL', 'Goes on everything, apparently.'],

    // ---- cleaning / chemicals ----
    ['bleach', 'Bleach', 'jug', [0.13, 0.27, 0.1], ['#ffffff', '#1d4ed8', '#1d4ed8'], 'BLEACH', 'Regular bleach. Never mix with ammonia.'],
    ['dish_soap', 'Dish Soap', 'bottle', [0.035, 0.22], ['#2e7dd7', '#ffffff', '#ffffff'], 'DISH', 'Blue dish soap.'],
    ['dish_soap_green', 'Dish Soap', 'bottle', [0.035, 0.22], ['#43a047', '#ffffff', '#ffffff'], 'DISH', 'Apple-scented dish soap.'],
    ['dishwasher_pods', 'Dishwasher Pods', 'tub', [0.07, 0.15], ['#1d4ed8', '#ffd60a', '#ff8f1f'], 'PODS', 'Not candy.'],
    ['all_purpose', 'All-Purpose Cleaner', 'spray', [0.04, 0.26], ['#ffffff', '#43a047', '#43a047'], 'CLEAN', 'Lemon all-purpose spray.'],
    ['glass_cleaner', 'Glass Cleaner', 'spray', [0.04, 0.26], ['#29b6f6', '#ffffff', '#1d4ed8'], 'GLASS', 'Streak-free glass cleaner.'],
    ['drain_cleaner', 'Drain Cleaner', 'jug', [0.1, 0.24, 0.08], ['#ff8f1f', '#111111', '#111111'], 'DRAIN', 'Gel drain clog remover. Corrosive.'],
    ['oven_cleaner', 'Oven Cleaner', 'can', [0.035, 0.2], ['#ffd60a', '#c62828'], 'OVEN', 'Heavy-duty aerosol oven cleaner.'],
    ['ammonia', 'Ammonia', 'jug', [0.11, 0.25, 0.09], ['#ffffff', '#7b1fa2', '#7b1fa2'], 'AMMONIA', 'Clear ammonia. Keep away from bleach.'],
    ['furniture_polish', 'Furniture Polish', 'can', [0.035, 0.2], ['#ffd60a', '#6d4c41'], 'POLISH', 'Lemon furniture polish.'],
    ['bug_spray', 'Roach Spray', 'can', [0.035, 0.2], ['#c62828', '#ffd60a'], 'ROACH', 'Kills on contact.'],
    ['disinfect_wipes', 'Disinfecting Wipes', 'tub', [0.06, 0.18], ['#ffd60a', '#1d4ed8', '#1d4ed8'], 'WIPES', 'Kills 99.9% of germs.'],
    ['sponge', 'Sponge', 'box', [0.1, 0.035, 0.07], ['#ffd60a', null], '', 'Kitchen sponge with green scrub side.'],
    ['sponge_gross', 'Gross Sponge', 'box', [0.1, 0.03, 0.07], ['#8a8a3a', null], '', 'Smells like a swamp.'],
    ['gloves', 'Rubber Gloves', 'flat', [0.12, 0.02, 0.22], ['#ffd60a'], '', 'Yellow dish gloves.'],
    ['trash_bags', 'Trash Bags', 'box', [0.15, 0.11, 0.25], ['#1d4ed8', '#ffd60a'], 'BAGS', '13 gallon drawstring bags.'],
    ['steel_wool', 'Steel Wool Pads', 'box', [0.1, 0.05, 0.07], ['#1d4ed8', '#c62828'], 'STEEL', 'Soap-filled steel wool.'],
    ['laundry_detergent', 'Laundry Detergent', 'jug', [0.18, 0.28, 0.12], ['#ff8f1f', '#1d4ed8', '#1d4ed8'], 'LAUNDRY', 'Liquid laundry detergent, 64 loads.'],
    ['fabric_softener', 'Dryer Sheets', 'box', [0.15, 0.14, 0.08], ['#90caf9', '#ffffff'], 'SOFT', 'April fresh dryer sheets.'],
    ['toilet_cleaner', 'Toilet Bowl Cleaner', 'bottle', [0.04, 0.24], ['#1d4ed8', '#ffffff', '#ffffff'], 'BOWL', 'Angled neck toilet bowl cleaner.'],
    ['scrub_cleanser', 'Scouring Powder', 'can', [0.04, 0.17], ['#2e7d32', '#ffd60a'], 'SCOUR', 'Powdered cleanser with bleach.'],
    ['air_freshener', 'Air Freshener', 'can', [0.03, 0.2], ['#ce93d8', '#ffffff'], 'FRESH', 'Lavender meadow.'],
    ['matches', 'Matches', 'box', [0.06, 0.02, 0.04], ['#c62828', '#ffd60a'], 'MATCH', 'Box of strike-anywhere matches.'],
    ['lighter', 'Lighter', 'box', [0.02, 0.07, 0.012], ['#ff4d6d', null], '', 'Disposable lighter.'],
    ['batteries', 'AA Batteries', 'box', [0.08, 0.1, 0.02], ['#111111', '#d4af37'], 'AA', 'Pack of AA batteries. Two left.'],
    ['tape', 'Duct Tape', 'roll', [0.05, 0.05], ['#9e9e9e'], '', 'Fixes almost anything.'],
    ['flashlight', 'Flashlight', 'bottle', [0.02, 0.18], ['#111111', null, '#ffd60a'], '', 'Works if you smack it.'],

    // ---- kitchen tools ----
    ['chef_knife', 'Chef\'s Knife', 'knife', [0.32], ['#d8dde3', '#1f1f1f'], '', '8-inch chef\'s knife. Sharp.'],
    ['bread_knife', 'Bread Knife', 'knife', [0.34], ['#d8dde3', '#5d4037'], '', 'Serrated bread knife.'],
    ['paring_knife', 'Paring Knife', 'knife', [0.2], ['#d8dde3', '#1f1f1f'], '', 'Small paring knife.'],
    ['steak_knife', 'Steak Knife', 'knife', [0.22], ['#d8dde3', '#4e342e'], '', 'Serrated steak knife.'],
    ['butcher_knife', 'Cleaver', 'knife', [0.3], ['#c0c6cc', '#3e2723'], '', 'Heavy meat cleaver.'],
    ['scissors', 'Scissors', 'scissors', [0.2], ['#c62828'], '', 'Household scissors.'],
    ['kitchen_shears', 'Kitchen Shears', 'scissors', [0.22], ['#111111'], '', 'Kitchen shears. Cut through chicken bones.'],
    ['kid_scissors', 'Safety Scissors', 'scissors', [0.13], ['#3a86ff'], '', 'Blunt-tip kids\' scissors.'],
    ['fork', 'Fork', 'utensil', [0.19], ['#c9ced4'], 'fork', 'Stainless steel fork.'],
    ['spoon', 'Spoon', 'utensil', [0.18], ['#c9ced4'], 'spoon', 'Stainless steel spoon.'],
    ['butter_knife', 'Butter Knife', 'utensil', [0.2], ['#c9ced4'], 'knife', 'Table knife.'],
    ['spatula', 'Spatula', 'utensil', [0.3], ['#1f1f1f'], 'spatula', 'Nylon turner spatula.'],
    ['wooden_spoon', 'Wooden Spoon', 'utensil', [0.3], ['#c49a6c'], 'spoon', 'Wooden spoon, stained with sauce.'],
    ['whisk', 'Whisk', 'utensil', [0.26], ['#c9ced4'], 'whisk', 'Balloon whisk.'],
    ['ladle', 'Ladle', 'utensil', [0.3], ['#c9ced4'], 'spoon', 'Soup ladle.'],
    ['tongs', 'Tongs', 'utensil', [0.25], ['#c9ced4'], 'tongs', 'Locking kitchen tongs.'],
    ['peeler', 'Vegetable Peeler', 'utensil', [0.17], ['#2e7d32'], 'knife', 'Y-peeler.'],
    ['can_opener', 'Can Opener', 'scissors', [0.18], ['#424242'], '', 'Manual can opener.'],
    ['measuring_cups', 'Measuring Cups', 'bowl', [0.045], ['#c9ced4'], '', 'Nested measuring cups.'],
    ['corkscrew', 'Corkscrew', 'utensil', [0.12], ['#6d4c41'], 'knife', 'Waiter\'s corkscrew.'],
    ['rolling_pin', 'Rolling Pin', 'roll', [0.03, 0.4], ['#d7b98e'], '', 'Wooden rolling pin.', true],
    ['cutting_board', 'Cutting Board', 'box', [0.38, 0.02, 0.26], ['#c49a6c', null], '', 'Wooden cutting board, knife-scarred.'],
    ['plate', 'Dinner Plate', 'plate', [0.13], ['#f4f4f4'], '', 'White dinner plate.'],
    ['plate_dirty', 'Dirty Plate', 'plate', [0.13], ['#c9b98a'], '', 'Dried ketchup and something else.'],
    ['bowl', 'Bowl', 'bowl', [0.08], ['#f4f4f4'], '', 'Cereal bowl.'],
    ['bowl_dirty', 'Dirty Bowl', 'bowl', [0.08], ['#d9cfa0'], '', 'Crusty cereal residue.'],
    ['mug', 'Coffee Mug', 'mug', [0.042, 0.1], ['#3a86ff'], '', 'Mug that says "World\'s Okayest Dad".'],
    ['mug2', 'Coffee Mug', 'mug', [0.042, 0.1], ['#ff4d6d'], '', 'Chipped red mug.'],
    ['mug3', 'Tea Cup', 'mug', [0.04, 0.07], ['#fff3e0'], '', 'Floral bone china tea cup.'],
    ['glass', 'Drinking Glass', 'glass', [0.035, 0.13], ['#cfefff'], '', 'Water glass.'],
    ['wine_glass', 'Wine Glass', 'glass', [0.035, 0.18], ['#e8f8ff'], '', 'Stemmed wine glass.'],
    ['sippy_cup', 'Sippy Cup', 'tub', [0.035, 0.12], ['#06d6a0', '#ffd60a', '#ff4d6d'], '', 'Spill-proof kids\' cup.'],
    ['pot', 'Cooking Pot', 'mug', [0.11, 0.14], ['#9ea7ad'], '', 'Stainless stock pot.'],
    ['pan', 'Frying Pan', 'plate', [0.13], ['#2b2b2b'], '', 'Non-stick skillet, scratched.'],
    ['baking_sheet', 'Baking Sheet', 'box', [0.45, 0.02, 0.32], ['#9ea7ad', null], '', 'Aluminum sheet pan, stained.'],
    ['tupperware', 'Food Storage Container', 'box', [0.15, 0.08, 0.15], ['#e0f7fa', null], '', 'Lid missing, as always.'],
    ['paper_towels', 'Paper Towels', 'roll', [0.055, 0.28], ['#ffffff'], '', 'Select-a-size paper towels.'],
    ['foil', 'Aluminum Foil', 'box', [0.31, 0.05, 0.05], ['#1d4ed8', '#c9ced4'], 'FOIL', 'Heavy duty aluminum foil.'],
    ['plastic_wrap', 'Plastic Wrap', 'box', [0.31, 0.05, 0.05], ['#c62828', '#ffffff'], 'WRAP', 'Clings to itself, never to the bowl.'],
    ['ziploc', 'Zip Bags', 'box', [0.2, 0.1, 0.06], ['#1d4ed8', '#ffffff'], 'ZIP', 'Gallon freezer bags.'],
    ['oven_mitt', 'Oven Mitt', 'flat', [0.14, 0.03, 0.26], ['#c62828'], '', 'Quilted oven mitt with a burn mark.'],
    ['dish_towel', 'Dish Towel', 'flat', [0.25, 0.02, 0.2], ['#f4f4f4'], '', 'Striped dish towel.'],
    ['takeout_menus', 'Takeout Menus', 'flat', [0.15, 0.02, 0.22], ['#ffd60a'], '', 'Pizza, Thai, Chinese, Indian.'],
    ['rubber_bands', 'Rubber Bands', 'flat', [0.05, 0.015, 0.05], ['#c49a6c'], '', 'A tangle of rubber bands.'],
    ['pen', 'Pen', 'utensil', [0.14], ['#1d4ed8'], 'knife', 'Ballpoint pen. Probably dead.'],
    ['keys', 'Spare Keys', 'flat', [0.06, 0.01, 0.03], ['#d4af37'], '', 'Nobody knows what these open.'],
    ['twist_ties', 'Twist Ties', 'flat', [0.05, 0.01, 0.05], ['#2e7d32'], '', 'Saved from bread bags for 10 years.'],
    ['pill_organizer', 'Pill Organizer', 'box', [0.2, 0.03, 0.05], ['#7e57c2', '#ffffff', '#7e57c2'], 'SMTWTFS', 'Weekly pill organizer. Wednesday is empty.'],

    // ---- bathroom ----
    ['shampoo', 'Shampoo', 'bottle', [0.035, 0.22], ['#00b4d8', '#ffffff', '#ffffff'], 'SHAMPOO', 'Clarifying shampoo.'],
    ['conditioner', 'Conditioner', 'bottle', [0.035, 0.22], ['#ff8fab', '#ffffff', '#ffffff'], 'COND.', 'Moisturizing conditioner.'],
    ['two_in_one', '2-in-1 Shampoo', 'bottle', [0.04, 0.24], ['#1f1f1f', '#1d4ed8', '#1d4ed8'], '2IN1', 'Shampoo + conditioner for men. Smells like "Glacier".'],
    ['body_wash', 'Body Wash', 'bottle', [0.04, 0.22], ['#7cff3a', '#111111', '#111111'], 'WASH', 'Sport scent body wash.'],
    ['body_wash2', 'Body Wash', 'bottle', [0.04, 0.22], ['#f4c2c2', '#ffffff', '#ffffff'], 'SHEA', 'Shea butter body wash.'],
    ['kids_shampoo', 'Kids Shampoo', 'bottle', [0.035, 0.18], ['#ffd60a', '#ff4d6d', '#ff4d6d'], 'NO TEARS', 'Tear-free kids\' shampoo.'],
    ['bar_soap', 'Bar Soap', 'box', [0.09, 0.03, 0.06], ['#ffffff', null], '', 'Bar of soap. Small and cracked.'],
    ['hand_soap', 'Hand Soap', 'bottle', [0.035, 0.18], ['#ce93d8', '#ffffff', '#ffffff'], 'SOAP', 'Lavender hand soap pump.'],
    ['toothpaste', 'Toothpaste', 'box', [0.18, 0.035, 0.04], ['#ffffff', '#c62828', '#1d4ed8'], 'PASTE', 'Squeezed from the middle. Of course.'],
    ['toothbrush', 'Toothbrush', 'utensil', [0.19], ['#3a86ff'], 'knife', 'Manual toothbrush.'],
    ['toothbrush2', 'Toothbrush', 'utensil', [0.19], ['#ff4d6d'], 'knife', 'Manual toothbrush.'],
    ['electric_toothbrush', 'Electric Toothbrush', 'bottle', [0.018, 0.22], ['#ffffff', null, '#3a86ff'], '', 'Electric toothbrush on its charger.'],
    ['mouthwash', 'Mouthwash', 'bottle', [0.04, 0.22], ['#00c853', '#ffffff', '#ffffff'], 'MINT', 'Antiseptic mouthwash.'],
    ['floss', 'Dental Floss', 'box', [0.045, 0.045, 0.015], ['#ffffff', '#00b4d8'], '', 'Mint floss. Mostly unused.'],
    ['razor', 'Razor', 'utensil', [0.16], ['#1d4ed8'], 'knife', '5-blade razor.'],
    ['shaving_cream', 'Shaving Cream', 'can', [0.033, 0.17], ['#1d4ed8', '#ffffff'], 'SHAVE', 'Shaving gel.'],
    ['deodorant', 'Deodorant', 'box', [0.06, 0.13, 0.04], ['#111111', '#d4af37'], 'DEO', 'Antiperspirant.'],
    ['deodorant2', 'Deodorant', 'box', [0.06, 0.12, 0.04], ['#f8bbd0', '#ffffff'], 'FRESH', 'Powder fresh deodorant.'],
    ['toilet_paper', 'Toilet Paper', 'roll', [0.055, 0.11], ['#ffffff'], '', 'Double roll toilet paper.'],
    ['toilet_paper_pack', 'Toilet Paper (12 pack)', 'box', [0.33, 0.24, 0.22], ['#ffffff', '#1d4ed8'], 'TP', '12 mega rolls.'],
    ['plunger', 'Plunger', 'custom_plunger', [], [], '', 'Toilet plunger.'],
    ['toilet_brush', 'Toilet Brush', 'custom_brush', [], [], '', 'Toilet brush in a holder.'],
    ['lotion', 'Lotion', 'bottle', [0.04, 0.2], ['#ffffff', '#81d4fa', '#81d4fa'], 'LOTION', 'Unscented daily lotion.'],
    ['makeup_bag', 'Makeup Bag', 'bag', [0.2, 0.1, 0.08], ['#f8bbd0', '#ff4d6d'], '', 'Foundation, mascara, three lipsticks.'],
    ['lipstick', 'Lipstick', 'bottle', [0.01, 0.07], ['#b71c1c', null, '#d4af37'], '', 'Ruby red lipstick.'],
    ['perfume', 'Perfume', 'jar', [0.03, 0.09], ['#ffc8dd', null, '#d4af37'], '', 'An expensive perfume, saved for special occasions.'],
    ['cologne', 'Cologne', 'jar', [0.03, 0.11], ['#263238', null, '#c0c0c0'], '', 'Woody cologne. Too much of it.'],
    ['hair_dryer', 'Hair Dryer', 'custom_dryer', [], ['#ff4d6d'], '', 'Hair dryer, 1875 watts.'],
    ['hairbrush', 'Hairbrush', 'utensil', [0.23], ['#1f1f1f'], 'spoon', 'Paddle hairbrush full of hair.'],
    ['comb', 'Comb', 'utensil', [0.15], ['#1f1f1f'], 'knife', 'Black pocket comb.'],
    ['pain_reliever', 'Pain Reliever', 'jar', [0.025, 0.09], ['#ffffff', '#c62828', '#ffffff'], 'IBU', 'Ibuprofen 200mg, 100 tablets.'],
    ['acetaminophen', 'Acetaminophen', 'jar', [0.025, 0.09], ['#ffffff', '#1d4ed8', '#ffffff'], 'ACETA', 'Extra strength acetaminophen.'],
    ['cold_medicine', 'Cold Medicine', 'box', [0.08, 0.1, 0.03], ['#1d4ed8', '#ff8f1f'], 'COLD', 'Nighttime cold & flu relief.'],
    ['cough_syrup', 'Cough Syrup', 'bottle', [0.03, 0.14], ['#4a148c', '#ffffff', '#ffffff'], 'COUGH', 'Cherry cough syrup.'],
    ['kids_medicine', 'Children\'s Fever Reducer', 'bottle', [0.025, 0.12], ['#ff4d6d', '#ffffff', '#ffffff'], 'KIDS', 'Bubblegum flavor. Use the measuring cup.'],
    ['bandaids', 'Bandages', 'box', [0.09, 0.07, 0.03], ['#ffffff', '#c62828'], 'BAND', 'Assorted adhesive bandages. Dinosaur ones too.'],
    ['prescription', 'Prescription Bottle', 'jar', [0.022, 0.08], ['#ff8f1f', '#ffffff', '#ffffff'], 'RX', 'Take 1 tablet daily with food.'],
    ['prescription2', 'Blood Pressure Pills', 'jar', [0.022, 0.08], ['#ff8f1f', '#ffffff', '#ffffff'], 'RX', 'Lisinopril 10mg. Take once daily.'],
    ['vitamins', 'Multivitamins', 'jar', [0.03, 0.11], ['#ffffff', '#2e7d32', '#2e7d32'], 'VITAMIN', 'Daily multivitamin gummies.'],
    ['nail_clippers', 'Nail Clippers', 'flat', [0.06, 0.012, 0.015], ['#c0c0c0'], '', 'Nail clippers.'],
    ['cotton_swabs', 'Cotton Swabs', 'tub', [0.04, 0.1], ['#e3f2fd', '#1d4ed8', '#1d4ed8'], 'SWABS', 'Cotton swabs.'],
    ['sunscreen', 'Sunscreen', 'bottle', [0.035, 0.17], ['#ff8f1f', '#ffffff', '#ffffff'], 'SPF 50', 'SPF 50 sunscreen. Expired 2 summers ago.'],
    ['peroxide', 'Hydrogen Peroxide', 'bottle', [0.04, 0.2], ['#3e2723', '#ffffff', '#ffffff'], 'H2O2', 'Hydrogen peroxide 3%.'],
    ['rubbing_alcohol', 'Rubbing Alcohol', 'bottle', [0.04, 0.2], ['#e3f2fd', '#1d4ed8', '#1d4ed8'], 'ALCOHOL', '70% isopropyl alcohol.'],
    ['rubber_duck', 'Rubber Duck', 'duck', [0.05], ['#ffd60a'], '', 'Squeak.'],
    ['towel', 'Towel', 'flat', [0.4, 0.06, 0.3], ['#4fc3f7'], '', 'Folded bath towel.'],
    ['towel_dirty', 'Wet Towel', 'flat', [0.5, 0.04, 0.45], ['#7a8a8a'], '', 'Damp and mildewy.'],
    ['tissues', 'Tissues', 'box', [0.22, 0.09, 0.12], ['#a5d6a7', '#ffffff'], 'TISSUE', 'Box of tissues with lotion.'],
    ['dentures_cup', 'Denture Cup', 'tub', [0.045, 0.08], ['#e0f7fa', null, '#80deea'], '', 'Denture cleaning tablets and a cup.'],

    // ---- bedroom / living ----
    ['book', 'Book', 'book', [0.15, 0.22, 0.04], ['#1d3557'], '', 'A paperback thriller, dog-eared.'],
    ['book2', 'Book', 'book', [0.16, 0.24, 0.05], ['#8c1c13'], '', 'A hardcover cookbook.'],
    ['book3', 'Book', 'book', [0.14, 0.21, 0.03], ['#2a9d8f'], '', 'A romance novel.'],
    ['textbook', 'Textbook', 'book', [0.22, 0.28, 0.05], ['#e9c46a'], '', 'Organic Chemistry, 9th edition. $310 new.'],
    ['kids_book', 'Picture Book', 'book', [0.22, 0.22, 0.015], ['#ff4d6d'], '', 'A picture book about a very hungry dinosaur.'],
    ['magazine', 'Magazine', 'flat', [0.21, 0.01, 0.28], ['#ff8f1f'], '', 'Home & garden magazine.'],
    ['crossword', 'Crossword Book', 'flat', [0.2, 0.015, 0.27], ['#1d4ed8'], '', 'Large print crosswords. Done in pen.'],
    ['photo_album', 'Photo Album', 'book', [0.3, 0.06, 0.25], ['#5d4037'], '', 'Photos from 1972 to 2009.'],
    ['phone', 'Phone', 'box', [0.075, 0.008, 0.15], ['#111111', null], '', 'Smartphone. 3% battery.'],
    ['phone_charger', 'Phone Charger', 'flat', [0.05, 0.02, 0.05], ['#ffffff'], '', 'Charging cable, frayed.'],
    ['laptop', 'Laptop', 'box', [0.33, 0.02, 0.23], ['#9ea7ad', null], '', 'Laptop with 47 browser tabs open.'],
    ['remote', 'TV Remote', 'box', [0.05, 0.02, 0.18], ['#1f1f1f', null], '', 'TV remote. The back cover is taped on.'],
    ['controller', 'Game Controller', 'box', [0.15, 0.04, 0.1], ['#1f1f1f', null], '', 'Wireless game controller. Stick drift.'],
    ['headphones', 'Headphones', 'flat', [0.18, 0.06, 0.16], ['#111111'], '', 'Over-ear headphones.'],
    ['glasses', 'Reading Glasses', 'flat', [0.13, 0.02, 0.05], ['#5d4037'], '', '+2.0 reading glasses.'],
    ['wallet', 'Wallet', 'box', [0.11, 0.02, 0.09], ['#4e342e', null], '', 'Leather wallet with $14 and a punch card.'],
    ['watch', 'Watch', 'flat', [0.05, 0.015, 0.05], ['#c0c0c0'], '', 'Wrist watch.'],
    ['alarm_clock', 'Alarm Clock', 'box', [0.14, 0.08, 0.07], ['#1f1f1f', '#1f1f1f', '#ff3030'], '7:42', 'Digital alarm clock.'],
    ['jewelry_box', 'Jewelry Box', 'box', [0.2, 0.09, 0.14], ['#6d3b1f', null], '', 'Earrings, a wedding band, a locket.'],
    ['candle', 'Candle', 'candle', [0.04, 0.1], ['#f8bbd0'], '', 'Scented candle: "Clean Linen".'],
    ['plant_small', 'Potted Succulent', 'plant', [0.06], ['#c1440e'], '', 'A small succulent. Still alive.'],
    ['tv_guide', 'Sticky Note', 'flat', [0.08, 0.005, 0.08], ['#ffeb3b'], '', 'Says "CALL MOM".'],
    ['shirt', 'Folded Shirt', 'clothes', [0.3, 0.05, 0.25], ['#3a86ff'], '', 'Folded t-shirt.'],
    ['shirt2', 'Folded Shirt', 'clothes', [0.3, 0.05, 0.25], ['#f4f4f4'], '', 'Folded white t-shirt.'],
    ['jeans', 'Folded Jeans', 'clothes', [0.32, 0.06, 0.25], ['#2b4a8b'], '', 'Folded jeans.'],
    ['sweater', 'Sweater', 'clothes', [0.32, 0.08, 0.26], ['#a23b72'], '', 'Hand-knit sweater.'],
    ['socks', 'Socks', 'clothes', [0.12, 0.05, 0.1], ['#f4f4f4'], '', 'Balled-up socks.'],
    ['kids_clothes', 'Kids\' Clothes', 'clothes', [0.2, 0.05, 0.18], ['#06d6a0'], '', 'Tiny folded dinosaur shirt.'],
    ['laundry_pile', 'Dirty Laundry', 'pile', [0.5], ['#5c6b7a'], '', 'Smells like a gym bag.'],
    ['laundry_pile2', 'Dirty Laundry', 'pile', [0.45], ['#8a5a44'], '', 'Jeans, hoodies, and one sock.'],
    ['sneakers', 'Sneakers', 'shoe', [0.3], ['#ffffff'], '', 'Running shoes.'],
    ['boots', 'Boots', 'shoe', [0.3], ['#5d4037'], '', 'Work boots.'],
    ['kid_shoes', 'Kid Shoes', 'shoe', [0.18], ['#ff4d6d'], '', 'Light-up sneakers.'],
    ['slippers', 'Slippers', 'shoe', [0.27], ['#ce93d8'], '', 'Fuzzy slippers.'],
    ['hanger', 'Hanger', 'flat', [0.4, 0.01, 0.02], ['#f4f4f4'], '', 'Plastic hanger.'],
    ['yarn', 'Yarn Ball', 'fruit', [0.05], ['#e63946'], '', 'Ball of red yarn. The cat wants it.'],
    ['knitting', 'Knitting Needles', 'utensil', [0.3], ['#c49a6c'], 'knife', 'Knitting needles with half a scarf.'],
    ['tablet', 'Tablet', 'box', [0.24, 0.01, 0.17], ['#1f1f1f', null], '', 'Tablet in a rubber kid case.'],

    // ---- trash / mess ----
    ['pizza_box', 'Pizza Box', 'pizzabox', [0.4], ['#e8d4b0'], '', 'Empty except for one crust.'],
    ['crushed_can', 'Crushed Can', 'can', [0.033, 0.06], ['#c9d6e3', '#0d47a1'], 'LAGER', 'Crushed beer can.'],
    ['chip_bag_empty', 'Empty Chip Bag', 'flat', [0.18, 0.02, 0.25], ['#ffd60a'], '', 'Crumbs only.'],
    ['fast_food_bag', 'Fast Food Bag', 'bag', [0.16, 0.22, 0.1], ['#b5835a', '#c62828'], '', 'Greasy paper bag. Two fries inside.'],
    ['trash_bag_full', 'Full Trash Bag', 'fruit', [0.25], ['#1a1a1a'], '', 'Tied off. Leaking slightly.'],
    ['solo_cup', 'Red Cup', 'tub', [0.045, 0.12], ['#d62828', null, '#d62828'], '', 'Red party cup. Something sticky in the bottom.'],
    ['ping_pong', 'Ping Pong Ball', 'fruit', [0.02], ['#ffffff'], '', 'Beer pong ball.'],
    ['cigarettes', 'Vape', 'box', [0.03, 0.08, 0.015], ['#7b1fa2', null], '', 'Blue razz vape. Dead.'],

    // ---- toys ----
    ['teddy', 'Teddy Bear', 'teddy', [0.12], ['#a0522d'], '', 'Mr. Buttons. Missing an eye.'],
    ['bunny', 'Stuffed Bunny', 'teddy', [0.1], ['#f8bbd0'], '', 'A floppy pink bunny.'],
    ['dino', 'Toy Dinosaur', 'toycar', [0.18], ['#2e9b3f'], '', 'Plastic T-rex. Roars when squeezed.'],
    ['toy_car', 'Toy Car', 'toycar', [0.12], ['#e63946'], '', 'Die-cast race car.'],
    ['toy_truck', 'Toy Dump Truck', 'toycar', [0.22], ['#ffd60a'], '', 'Dump truck full of sand.'],
    ['blocks', 'Letter Block', 'block', [0.06], ['#3a86ff'], 'A', 'Wooden alphabet block.'],
    ['blocks2', 'Letter Block', 'block', [0.06], ['#ff4d6d'], 'B', 'Wooden alphabet block.'],
    ['blocks3', 'Letter Block', 'block', [0.06], ['#06d6a0'], 'C', 'Wooden alphabet block.'],
    ['lego', 'Building Bricks', 'box', [0.06, 0.03, 0.03], ['#e63946', null], '', 'Do not step on.'],
    ['ball', 'Bouncy Ball', 'ball', [0.1], ['#ff4d6d'], '', 'Big rubber playground ball.'],
    ['soccer_ball', 'Soccer Ball', 'ball', [0.11], ['#f4f4f4'], '', 'Soccer ball.'],
    ['crayons', 'Crayons', 'box', [0.13, 0.09, 0.03], ['#ffd60a', '#2e7d32'], 'CRAYONS', '64 crayons. The good box.'],
    ['coloring_book', 'Coloring Book', 'flat', [0.22, 0.01, 0.28], ['#06d6a0'], '', 'Half colored, outside the lines.'],
    ['doll', 'Doll', 'teddy', [0.08], ['#ffb4a2'], '', 'A doll with chopped hair.'],
    ['puzzle', 'Puzzle Box', 'box', [0.3, 0.06, 0.2], ['#8338ec', '#ffd60a'], 'PUZZLE', '100 piece puzzle. 97 pieces.'],
    ['board_game', 'Board Game', 'box', [0.4, 0.07, 0.27], ['#fb5607', '#ffffff'], 'GAME', 'Family board game. Causes arguments.'],
    ['action_figure', 'Action Figure', 'teddy', [0.06], ['#1d4ed8'], '', 'Superhero action figure.'],
    ['toy_train', 'Toy Train', 'toycar', [0.15], ['#1d4ed8'], '', 'Wooden toy train engine.'],
    ['nightlight', 'Night Light', 'box', [0.06, 0.08, 0.03], ['#fff59d', null], '', 'Star-shaped night light.'],
    ['cat_toy', 'Cat Toy Mouse', 'fruit', [0.025], ['#9e9e9e'], '', 'Catnip mouse, well loved.'],

    // ---- tools (sledgehammer: electrical room, the rest: maintenance room) ----
    ['sledgehammer', 'Sledgehammer', 'custom_sledge', [], ['#c62828'], '', '10 lb sledgehammer. Hold left-click to wind up, let go to swing. Breaks drywall, studs, furniture... almost anything.'],
    ['claw_hammer', 'Claw Hammer', 'custom_hammer', [], ['#1d4ed8'], '', '16 oz claw hammer.'],
    ['screwdriver', 'Screwdriver', 'utensil', [0.22], ['#ffd60a'], 'knife', 'Phillips #2 screwdriver.'],
    ['wrench', 'Pipe Wrench', 'utensil', [0.35], ['#c62828'], 'tongs', '14" pipe wrench.'],
    ['drill', 'Cordless Drill', 'custom_drill', [], ['#ffd60a'], '', '20V cordless drill. Battery at one bar.'],
    ['tape_measure', 'Tape Measure', 'box', [0.07, 0.07, 0.04], ['#ffd60a', null], '', '25 ft tape measure.'],
    ['stud_finder', 'Stud Finder', 'box', [0.07, 0.15, 0.03], ['#ff8f1f', '#1f1f1f'], 'STUD', 'Beeps when it finds a stud. Studs are every 16 inches.'],
    ['utility_knife', 'Utility Knife', 'knife', [0.17], ['#c9ced4', '#ffd60a'], '', 'For scoring drywall.'],
    ['paint_can', 'Paint Can', 'can', [0.085, 0.19], ['#c9ced4', '#efe7d8'], 'PAINT', '1 gallon of "Landlord Beige" eggshell paint.'],
    ['spackle', 'Spackle', 'tub', [0.06, 0.08], ['#ffffff', '#1d4ed8', '#1d4ed8'], 'SPACKLE', 'For patching drywall holes. You\'ll need a lot.'],
    ['light_bulbs', 'Light Bulbs', 'box', [0.2, 0.12, 0.07], ['#1d4ed8', '#ffd60a'], 'LED', '4-pack of 60W-equivalent LED bulbs.'],
    ['duct_tape_pro', 'Electrical Tape', 'roll', [0.03, 0.02], ['#111111'], '', 'Black electrical tape.'],
    ['wire_nuts', 'Wire Nuts', 'box', [0.08, 0.04, 0.05], ['#ffd60a', '#c62828'], 'NUTS', 'Box of wire connectors.'],
    ['romex', 'Romex Cable (14/2)', 'roll', [0.12, 0.08], ['#f2f2ee'], '', '250 ft of 14/2 NM-B cable for 15A circuits.'],
    ['mop', 'Mop', 'utensil', [1.3], ['#c49a6c'], 'spatula', 'A mop that has seen things.'],

    // ---- gym ----
    ['dumbbell_light', 'Dumbbell (15 lb)', 'dumbbell', [0.3, 0.05], ['#1f1f1f'], '', '15 lb hex dumbbell.'],
    ['dumbbell', 'Dumbbell (35 lb)', 'dumbbell', [0.35, 0.07], ['#1f1f1f'], '', '35 lb hex dumbbell.'],
    ['dumbbell_heavy', 'Dumbbell (60 lb)', 'dumbbell', [0.4, 0.09], ['#1f1f1f'], '', '60 lb hex dumbbell. Heavy.'],
    ['kettlebell', 'Kettlebell (35 lb)', 'kettlebell', [0.09], ['#1f1f1f'], '', '35 lb cast iron kettlebell.'],
    ['kettlebell_pink', 'Kettlebell (10 lb)', 'kettlebell', [0.06], ['#ff4d6d'], '', 'Vinyl kettlebell.'],
    ['plate45', 'Weight Plate (45 lb)', 'weight', [0.22, 0.04], ['#1f1f1f'], '', '45 lb Olympic plate.'],
    ['plate25', 'Weight Plate (25 lb)', 'weight', [0.17, 0.035], ['#1f1f1f'], '', '25 lb Olympic plate.'],
    ['plate10', 'Weight Plate (10 lb)', 'weight', [0.13, 0.03], ['#1f1f1f'], '', '10 lb Olympic plate.'],
    ['shaker', 'Shaker Bottle', 'tub', [0.045, 0.2], ['#111111', null, '#ff1744'], '', 'Shaker bottle. Do NOT open it.'],
    ['jump_rope', 'Jump Rope', 'flat', [0.2, 0.03, 0.2], ['#1d4ed8'], '', 'Speed jump rope.'],
    ['resistance_bands', 'Resistance Bands', 'flat', [0.2, 0.03, 0.15], ['#ff8f1f'], '', 'Set of loop bands.'],
    ['lifting_belt', 'Lifting Belt', 'flat', [0.3, 0.1, 0.1], ['#4e342e'], '', '10mm leather lifting belt.'],
    ['chalk', 'Lifting Chalk', 'tub', [0.05, 0.08], ['#ffffff', '#111111', '#111111'], 'CHALK', 'Gets everywhere.'],
    ['foam_roller', 'Foam Roller', 'roll', [0.07, 0.4], ['#1d4ed8'], '', 'Foam roller. Pain.', true],
    ['gym_towel', 'Gym Towel', 'flat', [0.3, 0.03, 0.2], ['#9e9e9e'], '', 'Sweaty gym towel.'],
    ['headband', 'Headband', 'flat', [0.1, 0.02, 0.1], ['#ff1744'], '', 'Sweatband.'],
  ];

  const MATERIAL = {
    wine: 'glass', jar: 'glass', glass: 'glass', candle: 'wood', plate: 'porcelain', bowl: 'porcelain', mug: 'porcelain',
    can: 'metal', dumbbell: 'metal', kettlebell: 'metal', weight: 'metal', knife: 'metal', scissors: 'metal', utensil: 'metal',
    custom_hammer: 'metal', custom_sledge: 'metal', fruit: 'fabric', banana: 'fabric', clothes: 'fabric', pile: 'fabric',
    teddy: 'fabric', box: 'paper', bag: 'paper', book: 'paper', pizzabox: 'paper', flat: 'fabric', block: 'wood', plant: 'porcelain',
  };

  GU.CATALOG = {};
  for (const r of CATALOG) {
    GU.CATALOG[r[0]] = { id: r[0], name: r[1], shape: r[2], size: r[3], colors: r[4], text: r[5], desc: r[6], lying: r[7] || false };
  }

  const M = (c) => GU.mat(c);
  const lbl = (body, band, text, ink) => GU.mat('#ffffff', GU.tex.label(body, band, text, ink));

  // Each builder returns { g, fw, fd }: the group and its footprint width/depth.
  const builders = {
    box(g, s, c, t) {
      const [w, h, d] = s;
      GU.box(g, w, h, d, 0, 0, 0, lbl(c[0], c[1], t, c[2]), { unitUV: true });
      return [w, d];
    },
    carton(g, s, c, t) {
      const [w, h, d] = s;
      GU.box(g, w, h * 0.82, d, 0, 0, 0, lbl(c[0], c[1], t), { unitUV: true });
      const roof = GU.box(g, w * 0.72, w * 0.72, d * 0.98, 0, h * 0.82 - w * 0.36, 0, M(c[0]), { unitUV: true });
      roof.rotation.z = Math.PI / 4; roof.scale.y = 0.4;
      return [w, d];
    },
    jug(g, s, c, t) {
      const [w, h, d] = s;
      GU.box(g, w, h * 0.8, d, 0, 0, 0, lbl(c[0], c[1], t), { unitUV: true });
      GU.box(g, w * 0.7, h * 0.1, d * 0.7, 0, h * 0.8, 0, M(c[0]));
      GU.cyl(g, w * 0.14, w * 0.14, h * 0.1, -w * 0.15, h * 0.9, 0, M(c[2] || c[1]));
      GU.box(g, w * 0.12, h * 0.4, d * 0.4, w * 0.44, h * 0.4, 0, M(c[0]));
      return [w, d];
    },
    bottle(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r, h * 0.78, 0, 0, 0, c[1] ? lbl(c[0], c[1], t) : M(c[0]));
      GU.cyl(g, r * 0.45, r, h * 0.1, 0, h * 0.78, 0, M(c[0]));
      GU.cyl(g, r * 0.45, r * 0.45, h * 0.12, 0, h * 0.88, 0, M(c[2] || '#ffffff'));
      return [r * 2, r * 2];
    },
    wine(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r, h * 0.6, 0, 0, 0, lbl(c[0], c[1], t, '#222'));
      GU.cyl(g, r * 0.35, r, h * 0.1, 0, h * 0.6, 0, M(c[0]));
      GU.cyl(g, r * 0.32, r * 0.35, h * 0.3, 0, h * 0.7, 0, M(c[2] || c[0]));
      return [r * 2, r * 2];
    },
    can(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r, h, 0, 0, 0, lbl(c[0], c[1], t));
      return [r * 2, r * 2];
    },
    jar(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r, h * 0.82, 0, 0, 0, c[1] ? lbl(c[0], c[1], t, '#222') : M(c[0]));
      GU.cyl(g, r * 0.9, r * 0.9, h * 0.18, 0, h * 0.82, 0, M(c[2] || '#c62828'));
      return [r * 2, r * 2];
    },
    tub(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r * 0.92, h * 0.88, 0, 0, 0, c[1] ? lbl(c[0], c[1], t) : M(c[0]));
      GU.cyl(g, r * 1.02, r * 1.02, h * 0.12, 0, h * 0.88, 0, M(c[2] || c[0]));
      return [r * 2, r * 2];
    },
    spray(g, s, c, t) {
      const [r, h] = s;
      GU.cyl(g, r, r, h * 0.7, 0, 0, 0, lbl(c[0], c[1], t, '#222'));
      GU.cyl(g, r * 0.4, r * 0.6, h * 0.1, 0, h * 0.7, 0, M(c[0]));
      GU.box(g, r * 0.7, h * 0.12, r * 2.2, 0, h * 0.8, r * 0.5, M(c[2]));
      GU.box(g, r * 0.4, h * 0.12, r * 0.4, 0, h * 0.7, r * 1.1, M(c[2]));
      return [r * 2, r * 2.6];
    },
    bag(g, s, c, t) {
      const [w, h, d] = s;
      GU.box(g, w, h * 0.88, d, 0, 0, 0, lbl(c[0], c[1], t), { unitUV: true });
      GU.box(g, w * 0.95, h * 0.12, d * 0.4, 0, h * 0.88, 0, M(c[0]));
      return [w, d];
    },
    roll(g, s, c, t, def) {
      const [r, h] = s;
      const m = GU.cyl(g, r, r, h, 0, 0, 0, M(c[0]));
      if (def.lying) { m.rotation.z = Math.PI / 2; m.position.y = r; return [h, r * 2]; }
      return [r * 2, r * 2];
    },
    knife(g, s, c) {
      const L = s[0];
      GU.box(g, L * 0.62, 0.004, 0.035, L * 0.19, 0, 0, GU.mat(c[0], GU.tex.metal(c[0])));
      GU.box(g, L * 0.38, 0.02, 0.025, -L * 0.31, 0, 0, M(c[1]));
      return [L, 0.04];
    },
    scissors(g, s, c) {
      const L = s[0];
      const steel = GU.mat('#d8dde3', GU.tex.metal('#d8dde3'));
      GU.box(g, L * 0.55, 0.006, 0.014, L * 0.2, 0, 0.006, steel, { ry: 0.12 });
      GU.box(g, L * 0.55, 0.006, 0.014, L * 0.2, 0.006, -0.006, steel, { ry: -0.12 });
      GU.torus(g, L * 0.12, 0.008, -L * 0.25, 0.008, 0.03, M(c[0]), { rx: Math.PI / 2 });
      GU.torus(g, L * 0.12, 0.008, -L * 0.25, 0.008, -0.03, M(c[0]), { rx: Math.PI / 2 });
      return [L, L * 0.5];
    },
    utensil(g, s, c, t) {
      const L = s[0];
      const m = M(c[0]);
      GU.box(g, L * 0.7, 0.008, 0.016, -L * 0.15, 0, 0, m);
      if (t === 'spoon') GU.sphere(g, 0.025, L * 0.32, 0.01, 0, m, { sx: 1.4, sy: 0.3 });
      else if (t === 'fork' || t === 'tongs') GU.box(g, L * 0.3, 0.008, 0.03, L * 0.35, 0, 0, m);
      else if (t === 'spatula') GU.box(g, L * 0.3, 0.008, 0.08, L * 0.35, 0, 0, m);
      else if (t === 'whisk') GU.sphere(g, 0.035, L * 0.33, 0.035, 0, m, { sx: 2 });
      else GU.box(g, L * 0.3, 0.006, 0.022, L * 0.35, 0, 0, m);
      return [L, 0.05];
    },
    plate(g, s, c) {
      GU.cyl(g, s[0], s[0] * 0.75, 0.02, 0, 0, 0, M(c[0]), { seg: 12 });
      return [s[0] * 2, s[0] * 2];
    },
    bowl(g, s, c) {
      GU.cyl(g, s[0], s[0] * 0.55, s[0] * 0.7, 0, 0, 0, M(c[0]), { seg: 12 });
      return [s[0] * 2, s[0] * 2];
    },
    mug(g, s, c) {
      const [r, h] = s;
      GU.cyl(g, r, r, h, 0, 0, 0, M(c[0]));
      GU.cyl(g, r * 0.85, r * 0.85, 0.002, 0, h, 0, M('#3b2412'));
      GU.torus(g, h * 0.3, r * 0.15, r + h * 0.15, h * 0.5, 0, M(c[0]), { seg: 6 });
      return [r * 2 + h * 0.4, r * 2];
    },
    glass(g, s, c) {
      GU.cyl(g, s[0], s[0] * 0.85, s[1], 0, 0, 0, GU.mat(c[0], null, { transparent: true, opacity: 0.45 }));
      return [s[0] * 2, s[0] * 2];
    },
    fruit(g, s, c) {
      GU.sphere(g, s[0], 0, s[0], 0, M(c[0]), { seg: 7, rings: 5 });
      return [s[0] * 2, s[0] * 2];
    },
    banana(g, s, c) {
      for (let i = 0; i < 4; i++) {
        const m = GU.cyl(g, 0.016, 0.018, s[0], 0, 0.02, (i - 1.5) * 0.03, M(c[0]), { seg: 5 });
        m.rotation.z = Math.PI / 2 + (i - 1.5) * 0.08;
        m.position.y = 0.02;
      }
      return [s[0], 0.13];
    },
    book(g, s, c) {
      const [w, h, d] = s;
      GU.box(g, w, d, h, 0, 0, 0, M(c[0]));
      GU.box(g, w * 0.96, d * 0.8, h * 0.02, 0.005, d * 0.1, h * 0.495, M('#f4f1e8'));
      return [w, h];
    },
    clothes(g, s, c) {
      const [w, h, d] = s;
      GU.box(g, w, h, d, 0, 0, 0, GU.mat('#ffffff', GU.tex.fabric(c[0])));
      return [w, d];
    },
    flat(g, s, c) {
      const [w, h, d] = s;
      GU.box(g, w, h, d, 0, 0, 0, M(c[0]));
      return [w, d];
    },
    pile(g, s, c) {
      const r = s[0], m = GU.mat('#ffffff', GU.tex.fabric(c[0]));
      GU.sphere(g, r * 0.5, 0, r * 0.12, 0, m, { sx: 1.2, sy: 0.4, sz: 0.9 });
      GU.sphere(g, r * 0.3, r * 0.2, r * 0.25, 0.05, GU.mat('#ffffff', GU.tex.fabric('#2b4a8b')), { sx: 1.3, sy: 0.5 });
      GU.sphere(g, r * 0.25, -r * 0.2, r * 0.2, -0.1, GU.mat('#ffffff', GU.tex.fabric('#e0e0e0')), { sx: 1.5, sy: 0.4 });
      return [r * 1.2, r * 1];
    },
    pizzabox(g, s, c) {
      GU.box(g, s[0], 0.045, s[0], 0, 0, 0, GU.mat('#ffffff', GU.tex.label(c[0], '#c62828', 'PIZZA')), { unitUV: true });
      return [s[0], s[0]];
    },
    dumbbell(g, s, c) {
      const [L, r] = s, m = M(c[0]);
      const bar = GU.cyl(g, 0.016, 0.016, L, 0, r, 0, GU.mat('#c0c0c0', GU.tex.metal('#c0c0c0')));
      bar.rotation.z = Math.PI / 2; bar.position.y = r;
      for (const sx of [-1, 1]) {
        const h = GU.cyl(g, r, r, L * 0.22, sx * L * 0.39, r, 0, m, { seg: 6 });
        h.rotation.z = Math.PI / 2; h.position.y = r;
      }
      return [L, r * 2];
    },
    kettlebell(g, s, c) {
      const r = s[0];
      GU.sphere(g, r, 0, r, 0, M(c[0]), { seg: 8 });
      GU.torus(g, r * 0.55, r * 0.15, 0, r * 2, 0, M(c[0]), { arc: Math.PI, seg: 6 });
      return [r * 2, r * 2];
    },
    weight(g, s, c) {
      const [r, t] = s;
      GU.cyl(g, r, r, t, 0, 0, 0, M(c[0]), { seg: 14 });
      GU.cyl(g, 0.026, 0.026, t * 1.05, 0, 0, 0, GU.mat('#c0c0c0'));
      return [r * 2, r * 2];
    },
    ball(g, s, c) {
      GU.sphere(g, s[0], 0, s[0], 0, M(c[0]), { seg: 10, rings: 7 });
      return [s[0] * 2, s[0] * 2];
    },
    teddy(g, s, c) {
      const r = s[0], m = M(c[0]);
      GU.sphere(g, r, 0, r, 0, m, { sy: 1.1 });
      GU.sphere(g, r * 0.7, 0, r * 2.4, 0, m);
      GU.sphere(g, r * 0.25, -r * 0.5, r * 2.95, 0, m);
      GU.sphere(g, r * 0.25, r * 0.5, r * 2.95, 0, m);
      GU.sphere(g, r * 0.3, -r * 0.6, r * 0.3, r * 0.6, m);
      GU.sphere(g, r * 0.3, r * 0.6, r * 0.3, r * 0.6, m);
      GU.sphere(g, r * 0.08, -r * 0.25, r * 2.5, r * 0.62, M('#111'));
      GU.sphere(g, r * 0.08, r * 0.25, r * 2.5, r * 0.62, M('#111'));
      return [r * 2, r * 2];
    },
    toycar(g, s, c) {
      const L = s[0], m = M(c[0]);
      GU.box(g, L, L * 0.25, L * 0.5, 0, L * 0.08, 0, m);
      GU.box(g, L * 0.5, L * 0.2, L * 0.45, -L * 0.1, L * 0.33, 0, m);
      for (const x of [-0.32, 0.32]) for (const z of [-0.25, 0.25]) {
        const w = GU.cyl(g, L * 0.1, L * 0.1, L * 0.06, x * L, L * 0.1, z * L, M('#111'), { seg: 6 });
        w.rotation.x = Math.PI / 2; w.position.y = L * 0.1;
      }
      return [L, L * 0.55];
    },
    block(g, s, c, t) {
      GU.box(g, s[0], s[0], s[0], 0, 0, 0, lbl(c[0], null, t), { unitUV: true });
      return [s[0], s[0]];
    },
    duck(g, s, c) {
      const r = s[0];
      GU.sphere(g, r, 0, r * 0.8, 0, M(c[0]), { sx: 1.3, sy: 0.8 });
      GU.sphere(g, r * 0.6, r * 0.6, r * 1.7, 0, M(c[0]));
      GU.box(g, r * 0.5, r * 0.2, r * 0.4, r * 1.2, r * 1.55, 0, M('#ff8f1f'));
      return [r * 2.4, r * 2];
    },
    plant(g, s, c) {
      const r = s[0];
      GU.cyl(g, r, r * 0.75, r * 1.4, 0, 0, 0, M(c[0]));
      GU.sphere(g, r * 0.9, 0, r * 1.7, 0, M('#4caf50'), { seg: 6, rings: 4 });
      return [r * 2, r * 2];
    },
    candle(g, s, c) {
      GU.cyl(g, s[0], s[0], s[1], 0, 0, 0, M(c[0]));
      GU.box(g, 0.004, 0.015, 0.004, 0, s[1], 0, M('#222'));
      return [s[0] * 2, s[0] * 2];
    },
    shoe(g, s, c) {
      const L = s[0];
      GU.box(g, L, L * 0.08, L * 0.38, 0, 0, 0, M('#e0e0e0'));
      GU.box(g, L * 0.85, L * 0.2, L * 0.34, -L * 0.05, L * 0.08, 0, M(c[0]));
      GU.box(g, L * 0.35, L * 0.18, L * 0.32, -L * 0.3, L * 0.26, 0, M(c[0]));
      return [L, L * 0.4];
    },
    custom_plunger(g) {
      GU.cyl(g, 0.012, 0.012, 0.45, 0, 0.08, 0, M('#c49a6c'));
      GU.sphere(g, 0.075, 0, 0.08, 0, M('#b71c1c'), { sy: 0.8 });
      return [0.15, 0.15];
    },
    custom_brush(g) {
      GU.cyl(g, 0.055, 0.05, 0.12, 0, 0, 0, M('#e0e0e0'));
      GU.cyl(g, 0.01, 0.01, 0.3, 0, 0.1, 0, M('#e0e0e0'));
      return [0.11, 0.11];
    },
    custom_sledge(g) {
      const h = GU.cyl(g, 0.018, 0.022, 0.86, 0, 0.05, 0, M('#d7b98e'), { rz: Math.PI / 2 });
      h.position.set(0, 0.05, 0);
      GU.box(g, 0.08, 0.08, 0.18, 0.47, 0.01, 0, GU.mat('#ffffff', GU.tex.metal('#3a3a3a')));
      GU.box(g, 0.06, 0.05, 0.04, -0.4, 0.025, 0, M('#c62828'));
      return [1.0, 0.18];
    },
    custom_hammer(g, s, c) {
      const h = GU.cyl(g, 0.012, 0.014, 0.3, 0, 0.02, 0, M(c[0]), { rz: Math.PI / 2 });
      h.position.set(0, 0.02, 0);
      GU.box(g, 0.03, 0.03, 0.11, 0.16, 0.005, 0, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
      return [0.36, 0.11];
    },
    custom_drill(g, s, c) {
      GU.box(g, 0.2, 0.07, 0.06, 0, 0.12, 0, M(c[0]));
      GU.box(g, 0.05, 0.13, 0.05, -0.05, 0, 0, M('#1f1f1f'));
      GU.cyl(g, 0.006, 0.006, 0.08, 0.13, 0.15, 0, M('#9ea7ad'), { rz: Math.PI / 2 }).position.set(0.14, 0.155, 0);
      return [0.26, 0.07];
    },
    custom_dryer(g, s, c) {
      GU.cyl(g, 0.04, 0.035, 0.2, 0, 0.04, 0, M(c[0]), { rz: Math.PI / 2 });
      GU.box(g, 0.035, 0.12, 0.04, -0.05, 0, 0, M(c[0]));
      return [0.22, 0.08];
    },
  };

  // Build an item. overrides: { name, desc } to customize a single copy (e.g. "expired 3 weeks ago").
  GU.item = function (id, overrides) {
    const def = GU.CATALOG[id];
    if (!def) { console.warn('[Items] unknown item:', id); return null; }
    const d = Object.assign({}, def, overrides || {});
    const g = new THREE.Group();
    const fn = builders[d.shape] || builders.box;
    const fp = fn(g, d.size, d.colors, d.text, d);
    g.userData.footprint = fp;
    g.userData.item = d;
    GU.interactive(g, () => 'Take ' + d.name, () => GU.player && GU.player.pickUp(g), () => d.desc);
    // everything can be smashed; what it's made of decides the sound, debris and mess
    const mat = MATERIAL[d.shape] || 'plastic';
    const liquid = /jug|bottle|wine|spray/.test(d.shape) || (d.shape === 'can' && !/crushed|tuna|cat_food|soup|beans|tomatoes|oven|bug|furniture|air|shaving|paint/.test(id));
    if (d.id !== 'sledgehammer') g.userData.breakable = { hp: d.size[0] > 0.3 ? 2 : 1, mat, color: d.colors[0] || '#cccccc', name: d.name, leak: liquid ? 'small' : false, item: true };
    return g;
  };

  // Lay out items in rows on a shelf/surface. (x, y, z) is the center of the surface in parent space.
  // Accepts ids or [id, overrides]. Items that don't fit are skipped.
  GU.placeItems = function (parent, x, y, z, width, depth, list, opts) {
    opts = opts || {};
    const gap = opts.gap != null ? opts.gap : 0.015;
    let cx = -width / 2, rowZ = -depth / 2, rowDepth = 0;
    for (const entry of list) {
      if (!entry) continue;
      const [id, ov] = Array.isArray(entry) ? entry : [entry, null];
      const it = GU.item(id, ov);
      if (!it) continue;
      const [fw, fd] = it.userData.footprint;
      if (cx + fw > width / 2 + 0.001) { cx = -width / 2; rowZ += rowDepth + gap; rowDepth = 0; }
      if (rowZ + fd > depth / 2 + 0.02) break;
      it.position.set(x + cx + fw / 2, y, z + rowZ + fd / 2);
      if (opts.jitter) it.rotation.y = (Math.random() - 0.5) * opts.jitter;
      parent.add(it);
      cx += fw + gap;
      rowDepth = Math.max(rowDepth, fd);
    }
  };

  // Drop items at random spots within a rectangle (for clutter). rect = [x1, z1, x2, z2]
  GU.scatter = function (parent, rect, list, rng, y) {
    for (const entry of list) {
      const [id, ov] = Array.isArray(entry) ? entry : [entry, null];
      const it = GU.item(id, ov);
      if (!it) continue;
      it.position.set(GU.range(rng, rect[0], rect[2]), y || 0, GU.range(rng, rect[1], rect[3]));
      it.rotation.y = rng() * Math.PI * 2;
      parent.add(it);
    }
  };
})();
