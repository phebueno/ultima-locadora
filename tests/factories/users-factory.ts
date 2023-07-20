import { faker } from "@faker-js/faker";

export function generateUser() {
  return {
    id: faker.number.int(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    cpf: faker.finance.accountNumber(),
    birthday: faker.date.birthdate(),
  };
}

export function generateUnderageUser() {
  return {
    id: faker.number.int(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    cpf: faker.finance.accountNumber(),
    birthDate: faker.date.past(),
  };
}

//birthday: faker.date.birthdate({ max: 17, mode: 'age' })
