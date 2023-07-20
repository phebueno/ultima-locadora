import { faker } from "@faker-js/faker";
export function generateRental() {
  return {
    id: faker.number.int(),
    date: new Date().toString(),
    endDate: faker.date.future().toString(),
    userId: faker.number.int(),
    closed: faker.datatype.boolean(),
  };
}
