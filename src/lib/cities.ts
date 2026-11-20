// Cities for the overview layer, like the places a TV forecast shows.
// Listed by priority: tier 1 shows from the world view, tier 2 and 3 join in as you zoom.
export type City = { name: string; lat: number; lon: number; tier: 1 | 2 | 3 };

const t1: [string, number, number][] = [
  // Europe
  ["London", 51.51, -0.13], ["Paris", 48.86, 2.35], ["Madrid", 40.42, -3.70], ["Rome", 41.90, 12.50],
  ["Berlin", 52.52, 13.40], ["Moscow", 55.76, 37.62], ["Istanbul", 41.01, 28.98], ["Athens", 37.98, 23.73],
  ["Stockholm", 59.33, 18.07], ["Kyiv", 50.45, 30.52], ["Reykjavik", 64.15, -21.94],
  // Africa
  ["Cairo", 30.04, 31.24], ["Lagos", 6.52, 3.38], ["Nairobi", -1.29, 36.82], ["Johannesburg", -26.20, 28.05],
  ["Kinshasa", -4.32, 15.31], ["Casablanca", 33.57, -7.59], ["Addis Ababa", 9.03, 38.74], ["Dakar", 14.72, -17.47],
  ["Khartoum", 15.50, 32.56], ["Luanda", -8.84, 13.23], ["Tamanrasset", 22.79, 5.53],
  // Asia
  ["Tokyo", 35.68, 139.69], ["Beijing", 39.90, 116.41], ["Shanghai", 31.23, 121.47], ["Delhi", 28.61, 77.21],
  ["Mumbai", 19.08, 72.88], ["Dubai", 25.20, 55.27], ["Riyadh", 24.71, 46.68], ["Tehran", 35.69, 51.39],
  ["Bangkok", 13.76, 100.50], ["Singapore", 1.35, 103.82], ["Jakarta", -6.21, 106.85], ["Manila", 14.60, 120.98],
  ["Seoul", 37.57, 126.98], ["Hong Kong", 22.32, 114.17], ["Karachi", 24.86, 67.01], ["Dhaka", 23.81, 90.41],
  ["Ulaanbaatar", 47.89, 106.91], ["Almaty", 43.24, 76.89], ["Novosibirsk", 55.01, 82.93], ["Yakutsk", 62.03, 129.73],
  ["Lhasa", 29.65, 91.17], ["Urumqi", 43.83, 87.62],
  // Americas
  ["New York", 40.71, -74.01], ["Los Angeles", 34.05, -118.24], ["Chicago", 41.88, -87.63], ["Houston", 29.76, -95.37],
  ["Miami", 25.76, -80.19], ["Denver", 39.74, -104.99], ["Seattle", 47.61, -122.33], ["Toronto", 43.65, -79.38],
  ["Vancouver", 49.28, -123.12], ["Mexico City", 19.43, -99.13], ["Havana", 23.11, -82.37], ["Bogotá", 4.71, -74.07],
  ["Lima", -12.05, -77.04], ["São Paulo", -23.55, -46.63], ["Rio de Janeiro", -22.91, -43.17], ["Buenos Aires", -34.60, -58.38],
  ["Santiago", -33.45, -70.67], ["Manaus", -3.12, -60.02], ["Anchorage", 61.22, -149.90], ["Yellowknife", 62.45, -114.37],
  ["Iqaluit", 63.75, -68.52], ["Nuuk", 64.18, -51.72],
  // Oceania & islands
  ["Sydney", -33.87, 151.21], ["Perth", -31.95, 115.86], ["Darwin", -12.46, 130.84], ["Alice Springs", -23.70, 133.88],
  ["Auckland", -36.85, 174.76], ["Honolulu", 21.31, -157.86], ["Port Moresby", -9.44, 147.18],
];

const t2: [string, number, number][] = [
  // Europe
  ["Lisbon", 38.72, -9.14], ["Barcelona", 41.39, 2.17], ["Dublin", 53.35, -6.26], ["Edinburgh", 55.95, -3.19],
  ["Amsterdam", 52.37, 4.90], ["Brussels", 50.85, 4.35], ["Zurich", 47.38, 8.54], ["Vienna", 48.21, 16.37],
  ["Prague", 50.08, 14.44], ["Warsaw", 52.23, 21.01], ["Budapest", 47.50, 19.04], ["Bucharest", 44.43, 26.10],
  ["Belgrade", 44.79, 20.45], ["Sofia", 42.70, 23.32], ["Milan", 45.46, 9.19], ["Naples", 40.85, 14.27],
  ["Marseille", 43.30, 5.37], ["Munich", 48.14, 11.58], ["Hamburg", 53.55, 9.99], ["Copenhagen", 55.68, 12.57],
  ["Oslo", 59.91, 10.75], ["Helsinki", 60.17, 24.94], ["Riga", 56.95, 24.11], ["Minsk", 53.90, 27.56],
  ["St Petersburg", 59.93, 30.36], ["Kazan", 55.80, 49.11], ["Murmansk", 68.97, 33.07], ["Tromsø", 69.65, 18.96],
  ["Seville", 37.39, -5.98], ["Thessaloniki", 40.64, 22.94], ["Ankara", 39.93, 32.86], ["Odesa", 46.48, 30.72],
  // Africa & Middle East
  ["Algiers", 36.75, 3.06], ["Tunis", 36.81, 10.18], ["Tripoli", 32.89, 13.19], ["Marrakesh", 31.63, -8.01],
  ["Accra", 5.60, -0.19], ["Abidjan", 5.36, -4.01], ["Bamako", 12.64, -8.00], ["Niamey", 13.51, 2.11],
  ["N'Djamena", 12.13, 15.06], ["Kano", 12.00, 8.52], ["Douala", 4.05, 9.77], ["Kampala", 0.35, 32.58],
  ["Dar es Salaam", -6.79, 39.21], ["Mogadishu", 2.05, 45.32], ["Lusaka", -15.39, 28.32], ["Harare", -17.83, 31.05],
  ["Cape Town", -33.92, 18.42], ["Windhoek", -22.56, 17.08], ["Antananarivo", -18.88, 47.51], ["Maputo", -25.97, 32.57],
  ["Jerusalem", 31.77, 35.21], ["Beirut", 33.89, 35.50], ["Damascus", 33.51, 36.28], ["Baghdad", 33.31, 44.37],
  ["Kuwait City", 29.38, 47.99], ["Doha", 25.29, 51.53], ["Muscat", 23.59, 58.41], ["Sana'a", 15.37, 44.19],
  ["Jeddah", 21.49, 39.19], ["Baku", 40.41, 49.87], ["Tbilisi", 41.72, 44.79],
  // Asia
  ["Kabul", 34.56, 69.21], ["Tashkent", 41.30, 69.24], ["Lahore", 31.55, 74.34], ["Kathmandu", 27.72, 85.32],
  ["Kolkata", 22.57, 88.36], ["Chennai", 13.08, 80.27], ["Bengaluru", 12.97, 77.59], ["Colombo", 6.93, 79.86],
  ["Yangon", 16.84, 96.17], ["Hanoi", 21.03, 105.85], ["Ho Chi Minh City", 10.82, 106.63], ["Kuala Lumpur", 3.14, 101.69],
  ["Chengdu", 30.57, 104.07], ["Wuhan", 30.59, 114.31], ["Guangzhou", 23.13, 113.26], ["Xi'an", 34.34, 108.94],
  ["Harbin", 45.80, 126.53], ["Taipei", 25.03, 121.57], ["Osaka", 34.69, 135.50], ["Sapporo", 43.06, 141.35],
  ["Vladivostok", 43.12, 131.89], ["Irkutsk", 52.29, 104.30], ["Krasnoyarsk", 56.01, 92.89], ["Yekaterinburg", 56.84, 60.61],
  ["Norilsk", 69.35, 88.20], ["Magadan", 59.56, 150.80], ["Astana", 51.17, 71.45], ["Bishkek", 42.87, 74.59],
  ["Davao", 7.19, 125.46], ["Makassar", -5.15, 119.43], ["Surabaya", -7.25, 112.75],
  // Americas
  ["San Francisco", 37.77, -122.42], ["Phoenix", 33.45, -112.07], ["Dallas", 32.78, -96.80], ["Atlanta", 33.75, -84.39],
  ["Washington", 38.91, -77.04], ["Boston", 42.36, -71.06], ["Minneapolis", 44.98, -93.27], ["Las Vegas", 36.17, -115.14],
  ["New Orleans", 29.95, -90.07], ["Montreal", 45.50, -73.57], ["Calgary", 51.05, -114.07], ["Winnipeg", 49.90, -97.14],
  ["Edmonton", 53.55, -113.49], ["Whitehorse", 60.72, -135.06], ["Fairbanks", 64.84, -147.72], ["Monterrey", 25.69, -100.32],
  ["Guadalajara", 20.66, -103.35], ["Cancún", 21.16, -86.85], ["Guatemala City", 14.63, -90.51], ["Panama City", 8.98, -79.52],
  ["Santo Domingo", 18.49, -69.93], ["Caracas", 10.48, -66.90], ["Quito", -0.18, -78.47], ["La Paz", -16.50, -68.15],
  ["Brasília", -15.79, -47.88], ["Salvador", -12.97, -38.50], ["Recife", -8.05, -34.88], ["Belém", -1.46, -48.49],
  ["Asunción", -25.26, -57.58], ["Montevideo", -34.90, -56.16], ["Córdoba", -31.42, -64.18], ["Ushuaia", -54.80, -68.30],
  ["Punta Arenas", -53.16, -70.91],
  // Oceania
  ["Melbourne", -37.81, 144.96], ["Brisbane", -27.47, 153.03], ["Adelaide", -34.93, 138.60], ["Cairns", -16.92, 145.77],
  ["Hobart", -42.88, 147.33], ["Christchurch", -43.53, 172.64], ["Wellington", -41.29, 174.78], ["Nouméa", -22.28, 166.46],
  ["Suva", -18.14, 178.44], ["Papeete", -17.53, -149.57],
];

const t3: [string, number, number][] = [
  // Europe
  ["Porto", 41.15, -8.61], ["Valencia", 39.47, -0.38], ["Bilbao", 43.26, -2.93], ["Bordeaux", 44.84, -0.58],
  ["Lyon", 45.76, 4.84], ["Nice", 43.70, 7.27], ["Toulouse", 43.60, 1.44], ["Nantes", 47.22, -1.55],
  ["Manchester", 53.48, -2.24], ["Cardiff", 51.48, -3.18], ["Belfast", 54.60, -5.93], ["Cork", 51.90, -8.47],
  ["Frankfurt", 50.11, 8.68], ["Cologne", 50.94, 6.96], ["Leipzig", 51.34, 12.37], ["Geneva", 46.20, 6.14],
  ["Florence", 43.77, 11.26], ["Venice", 45.44, 12.32], ["Palermo", 38.12, 13.36], ["Bari", 41.12, 16.87],
  ["Turin", 45.07, 7.69], ["Zagreb", 45.81, 15.98], ["Ljubljana", 46.06, 14.51], ["Sarajevo", 43.86, 18.41],
  ["Tirana", 41.33, 19.82], ["Skopje", 42.00, 21.43], ["Podgorica", 42.44, 19.26], ["Bratislava", 48.15, 17.11],
  ["Kraków", 50.06, 19.94], ["Gdańsk", 54.35, 18.65], ["Vilnius", 54.69, 25.28], ["Tallinn", 59.44, 24.75],
  ["Chișinău", 47.01, 28.86], ["Lviv", 49.84, 24.03], ["Kharkiv", 49.99, 36.23], ["Rostov-on-Don", 47.24, 39.71],
  ["Volgograd", 48.71, 44.51], ["Bergen", 60.39, 5.32], ["Gothenburg", 57.71, 11.97], ["Oulu", 65.01, 25.47],
  ["Heraklion", 35.34, 25.14], ["Patras", 38.25, 21.73], ["Izmir", 38.42, 27.14], ["Antalya", 36.90, 30.70],
  ["Nicosia", 35.19, 33.38], ["Valletta", 35.90, 14.51], ["Palma", 39.57, 2.65], ["Málaga", 36.72, -4.42],
  // Africa & Middle East
  ["Alexandria", 31.20, 29.92], ["Aswan", 24.09, 32.90], ["Benghazi", 32.12, 20.07], ["Fez", 34.03, -5.00],
  ["Nouakchott", 18.08, -15.98], ["Ouagadougou", 12.37, -1.52], ["Freetown", 8.48, -13.23], ["Abuja", 9.08, 7.40],
  ["Libreville", 0.42, 9.47], ["Kigali", -1.94, 30.06], ["Mombasa", -4.04, 39.67], ["Juba", 4.85, 31.58],
  ["Djibouti", 11.59, 43.15], ["Lubumbashi", -11.66, 27.48], ["Durban", -29.86, 31.02], ["Gaborone", -24.65, 25.91],
  ["Port Elizabeth", -33.96, 25.60], ["Agadez", 16.97, 7.99], ["Timbuktu", 16.77, -3.01],
  ["Amman", 31.95, 35.93], ["Basra", 30.51, 47.81], ["Isfahan", 32.65, 51.67], ["Mashhad", 36.30, 59.61],
  ["Abu Dhabi", 24.45, 54.38], ["Medina", 24.47, 39.61], ["Aden", 12.79, 45.02], ["Yerevan", 40.18, 44.51],
  // Asia
  ["Islamabad", 33.68, 73.05], ["Jaipur", 26.91, 75.79], ["Ahmedabad", 23.02, 72.57], ["Hyderabad", 17.39, 78.49],
  ["Lucknow", 26.85, 80.95], ["Kochi", 9.93, 76.27], ["Thimphu", 27.47, 89.64], ["Chittagong", 22.36, 91.78],
  ["Mandalay", 21.95, 96.08], ["Chiang Mai", 18.79, 98.98], ["Phuket", 7.88, 98.39], ["Vientiane", 17.98, 102.63],
  ["Phnom Penh", 11.56, 104.93], ["Da Nang", 16.05, 108.20], ["Medan", 3.59, 98.67], ["Denpasar", -8.65, 115.22],
  ["Kuching", 1.55, 110.36], ["Cebu", 10.32, 123.89], ["Busan", 35.18, 129.08], ["Pyongyang", 39.04, 125.76],
  ["Fukuoka", 33.59, 130.40], ["Nagoya", 35.18, 136.91], ["Sendai", 38.27, 140.87], ["Kunming", 25.04, 102.71],
  ["Chongqing", 29.56, 106.55], ["Nanjing", 32.06, 118.80], ["Qingdao", 36.07, 120.38], ["Shenyang", 41.80, 123.43],
  ["Lanzhou", 36.06, 103.83], ["Hohhot", 40.84, 111.75], ["Kashgar", 39.47, 75.99], ["Xining", 36.62, 101.78],
  ["Omsk", 54.99, 73.37], ["Khabarovsk", 48.48, 135.08], ["Petropavlovsk", 53.02, 158.65], ["Chita", 52.03, 113.50],
  ["Dushanbe", 38.56, 68.79], ["Ashgabat", 37.96, 58.33], ["Samarkand", 39.65, 66.96],
  // Americas
  ["San Diego", 32.72, -117.16], ["Portland", 45.52, -122.68], ["Salt Lake City", 40.76, -111.89], ["Albuquerque", 35.08, -106.65],
  ["San Antonio", 29.42, -98.49], ["Kansas City", 39.10, -94.58], ["St. Louis", 38.63, -90.20], ["Nashville", 36.16, -86.78],
  ["Detroit", 42.33, -83.05], ["Philadelphia", 39.95, -75.17], ["Charlotte", 35.23, -80.84], ["Orlando", 28.54, -81.38],
  ["Boise", 43.62, -116.20], ["Billings", 45.78, -108.50], ["Bismarck", 46.81, -100.78], ["Quebec City", 46.81, -71.21],
  ["Halifax", 44.65, -63.58], ["St. John's", 47.56, -52.71], ["Ottawa", 45.42, -75.70], ["Regina", 50.45, -104.62],
  ["Churchill", 58.77, -94.17], ["Juneau", 58.30, -134.42], ["Nome", 64.50, -165.41], ["Utqiaġvik", 71.29, -156.79],
  ["Tijuana", 32.51, -117.04], ["Chihuahua", 28.63, -106.07], ["Mérida", 20.97, -89.59], ["Oaxaca", 17.07, -96.73],
  ["San José", 9.93, -84.09], ["Managua", 12.11, -86.24], ["Tegucigalpa", 14.07, -87.19], ["San Juan", 18.47, -66.11],
  ["Kingston", 17.97, -76.79], ["Port-au-Prince", 18.59, -72.31], ["Nassau", 25.05, -77.36], ["Medellín", 6.24, -75.58],
  ["Cali", 3.45, -76.53], ["Guayaquil", -2.19, -79.89], ["Cusco", -13.53, -71.97], ["Arequipa", -16.41, -71.54],
  ["Santa Cruz", -17.81, -63.16], ["Iquitos", -3.75, -73.25], ["Georgetown", 6.80, -58.16], ["Paramaribo", 5.85, -55.20],
  ["Fortaleza", -3.73, -38.53], ["Belo Horizonte", -19.92, -43.94], ["Curitiba", -25.43, -49.27], ["Porto Alegre", -30.03, -51.23],
  ["Cuiabá", -15.60, -56.10], ["Porto Velho", -8.76, -63.90], ["Antofagasta", -23.65, -70.40], ["Mendoza", -32.89, -68.83],
  ["Bariloche", -41.13, -71.31], ["Comodoro Rivadavia", -45.86, -67.48], ["Puerto Montt", -41.47, -72.94],
  // Oceania & islands
  ["Canberra", -35.28, 149.13], ["Townsville", -19.26, 146.82], ["Broome", -17.96, 122.24], ["Kalgoorlie", -30.75, 121.47],
  ["Dunedin", -45.88, 170.50], ["Queenstown", -45.03, 168.66], ["Apia", -13.83, -171.76], ["Hilo", 19.72, -155.09],
  ["Guam", 13.44, 144.79], ["Port Vila", -17.73, 168.32], ["Longyearbyen", 78.22, 15.65], ["Tórshavn", 62.01, -6.77],
  ["Las Palmas", 28.12, -15.43], ["Ponta Delgada", 37.74, -25.67], ["Funchal", 32.65, -16.91], ["Port Louis", -20.16, 57.50],
  ["Malé", 4.18, 73.51], ["Saint-Denis", -20.88, 55.45],
];

const toCities = (rows: [string, number, number][], tier: 1 | 2 | 3): City[] => rows.map(([name, lat, lon]) => ({ name, lat, lon, tier }));

export const CITIES: City[] = [...toCities(t1, 1), ...toCities(t2, 2), ...toCities(t3, 3)];

export type ScreenBox = { x1: number; y1: number; x2: number; y2: number };

/**
 * Picks the cities to show: inside the view, most important first, skipping any whose
 * label would overlap one already placed. `project` turns a city into screen pixels.
 */
export function pickCities(
  cities: City[],
  project: (c: City) => { x: number; y: number } | null,
  maxCount: number,
  reserved: ScreenBox[] = [] // space already taken, e.g. by place pins
): City[] {
  const placed: ScreenBox[] = [...reserved];
  const out: City[] = [];
  for (const c of cities) {
    if (out.length >= maxCount) break;
    const p = project(c);
    if (!p) continue;
    const w = c.name.length * 7 + 62; // name + icon + temperature, roughly
    const h = 30;
    const box = { x1: p.x - w / 2 - 4, y1: p.y - h / 2 - 4, x2: p.x + w / 2 + 4, y2: p.y + h / 2 + 4 };
    if (placed.some((b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1)) continue;
    placed.push(box);
    out.push(c);
  }
  return out;
}
