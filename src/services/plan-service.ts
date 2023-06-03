import { Response } from 'express';
import ResponseModel from '../models/response-model';

interface Dependencies {
  responseModel: typeof ResponseModel;
}

interface User {
  ID: string;
}

export default function ({ responseModel }: Dependencies) {
  async function getPlan(user: User, startDate: string, endDate: string) {
    try {
      console.log(`Request for meal plan received for ${user.ID} dates between: ${startDate} and ${endDate}`);

      // Function to generate a random string
      function generateRandomString(): string {
        return Math.random().toString(36).substring(7);
      }

      // Function to generate a random meal object
      function generateRandomMeal(currentDate: string) {
        return {
          title: "Meal " + generateRandomString(),
          id: generateRandomString(),
          date: currentDate,
          description: "Description for Meal " + generateRandomString()
        };
      }

      // Function to generate a random calendar map
      function generateRandomCalendarMap(startDate: Date, endDate: Date) {
        const calendarMap: { [date: string]: object[] } = {};
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const meals: object[] = [];
          const numMeals = Math.floor(Math.random() * 5) + 1; // Generate a random number of meals (1-5)

          const dateKey = currentDate.toISOString().split("T")[0]; // Get the date in "YYYY-MM-DD" format

          for (let i = 0; i < numMeals; i++) {
            meals.push(generateRandomMeal(dateKey)); // Generate a random meal object and add it to the meals array
          }

          calendarMap[dateKey] = meals; // Add the meals array to the calendar map with the date as the key

          currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        return calendarMap;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const mealPlan = generateRandomCalendarMap(start, end);

      const response = new responseModel(
        200,
        "success",
        mealPlan,
        "Meal plan fetched successfully"
      );

      return response

    } catch (err) {
      // logger.log(err);
      throw err;
    }
  }

  return {
    getPlan
  };
}
