import rentalsService from "../../src/services/rentals-service";
import rentalsRepository from "../../src/repositories/rentals-repository";
import moviesRepository from "../../src/repositories/movies-repository";
import usersRepository from "../../src/repositories/users-repository";

import { generateRental } from "../factories/rentals-factory";
import {
  generateAdultsMovieById,
  generateMovieWFixedRentalId,
  generateRentableMovie,
  generateRentedMovieById,
} from "../factories/movies-factory";
import { RentalInput } from "../../src/protocols";
import { generateUnderageUser, generateUser } from "../factories/users-factory";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Rentals Service Unit Tests", () => {
  describe("GET /rentals", () => {
    it("should return rentals list", async () => {
      jest
        .spyOn(rentalsRepository, "getRentals")
        .mockImplementationOnce((): any => {
          return [generateRental(), generateRental()];
        });

      const rentals = await rentalsService.getRentals();
      expect(rentals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            date: expect.any(String),
            endDate: expect.any(String),
            userId: expect.any(Number),
            closed: expect.any(Boolean),
          }),
        ])
      );
    });
  });

  describe("GET /rentals/:id", () => {
    it("should return rental by id", async () => {
      const newRental = generateRental();
      jest
        .spyOn(rentalsRepository, "getRentalById")
        .mockImplementationOnce((): any => {
          return {
            ...newRental,
            movies: [
              generateMovieWFixedRentalId(newRental.id),
              generateMovieWFixedRentalId(newRental.id),
            ],
          };
        });
      const rental = await rentalsService.getRentalById(newRental.id);
      expect(rental).toEqual({
        ...newRental,
        movies: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            adultsOnly: expect.any(Boolean),
            rentalId: newRental.id,
          }),
        ]),
      });
    });

    it("should return not found error when rentalId doesnt exist", async () => {
      jest
        .spyOn(rentalsRepository, "getRentalById")
        .mockImplementationOnce((): any => {
          return undefined;
        });

      const rental = rentalsService.getRentalById(999);
      expect(rental).rejects.toEqual({
        name: "NotFoundError",
        message: "Rental not found.",
      });
    });
  });

  describe("POST /rentals", () => {
    it("should return not found when user doesnt exist", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [1, 2, 3],
      };

      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return undefined;
      });

      const rental = rentalsService.createRental(newRentalInput);
      expect(rental).rejects.toEqual({
        name: "NotFoundError",
        message: "User not found.",
      });
    });
    it("should return error when user has an ongoing rental", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [1, 2, 3],
      };

      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return generateUser();
      });
      jest
        .spyOn(rentalsRepository, "getRentalsByUserId")
        .mockImplementationOnce((): any => {
          return [generateRental()];
        });
      const rental = rentalsService.createRental(newRentalInput);
      expect(rental).rejects.toEqual({
        name: "PendentRentalError",
        message: "The user already have a rental!",
      });
    });

    // it("should return unprocessable entity error when user rents more than 4 movies", async () => {
    //   const newRentalInput: RentalInput = {
    //     userId: 1,
    //     moviesId: [1, 2, 3, 4, 5, 6],
    //   };
    //   //passar para integration pois, apesar de ser regra de negócio, não é avaliado em services (?)
    // });

    it("should return error when movie doesnt exist", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [99],
      };
      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return generateUser();
      });
      jest
        .spyOn(rentalsRepository, "getRentalsByUserId")
        .mockImplementationOnce((): any => {
          return [];
        });

      jest
        .spyOn(moviesRepository, "getById")
        .mockImplementationOnce((): any => {
          return undefined;
        });

      const rental = rentalsService.createRental(newRentalInput);
      expect(rental).rejects.toEqual({
        name: "NotFoundError",
        message: "Movie not found.",
      });
    });

    it("should return error movie is rented", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [1],
      };
      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return generateUser();
      });
      jest
        .spyOn(rentalsRepository, "getRentalsByUserId")
        .mockImplementationOnce((): any => {
          return [];
        });

      jest
        .spyOn(moviesRepository, "getById")
        .mockImplementationOnce((): any => {
          return generateRentedMovieById(newRentalInput.moviesId[0]);
        });

      const rental = rentalsService.createRental(newRentalInput);
      expect(rental).rejects.toEqual({
        name: "MovieInRentalError",
        message: "Movie already in a rental.",
      });
    });

    it("should return error when user has insufficient age", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [1],
      };

      const youngUser = generateUnderageUser();

      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return youngUser;
      });
      jest
        .spyOn(rentalsRepository, "getRentalsByUserId")
        .mockImplementationOnce((): any => {
          return [];
        });

      const adultsMovie = generateAdultsMovieById(newRentalInput.moviesId[0]);
      jest
        .spyOn(moviesRepository, "getById")
        .mockImplementationOnce((): any => {
          return adultsMovie;
        });

      const rental = rentalsService.createRental(newRentalInput);
      expect(rental).rejects.toEqual({
        name: "InsufficientAgeError",
        message: "Cannot see that movie.",
      });
    });

    it("should return true when valid", async () => {
      const newRentalInput: RentalInput = {
        userId: 1,
        moviesId: [1],
      };
      jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
        return generateUser();
      });
      jest
        .spyOn(rentalsRepository, "getRentalsByUserId")
        .mockImplementationOnce((): any => {
          return [];
        });

      jest
        .spyOn(moviesRepository, "getById")
        .mockImplementationOnce((): any => {
          return generateRentableMovie(newRentalInput.moviesId[0]);
        });
      
      jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce(():any=>{
        return {}
      })

      const rental = await rentalsService.createRental(newRentalInput);
      expect(rentalsRepository.createRental).toBeCalled();
    });
  });
});
