import { faker } from "@faker-js/faker";

export function generateMovieWFixedRentalId(rentalId){
    return {
        id: faker.number.int(),
        name: faker.lorem.word(),
        adultsOnly: faker.datatype.boolean(),
        rentalId,
    }
}

export function generateRentableMovie(id){
    return {
        id,
        name: faker.lorem.word(),
        adultsOnly: faker.datatype.boolean(),
        rentalId: null,
    }
}

export function generateRentedMovieById(id){
    return {
        id,
        name: faker.lorem.word(),
        adultsOnly: faker.datatype.boolean(),
        rentalId: 99,
    }
}

export function generateAdultsMovieById(id){
    return {
        id,
        name: faker.lorem.word(),
        adultsOnly: true,
        rentalId: null,
    }
}

