import ResponseModel from '../models/response-model';
import UserModel from '../models/user-model';

import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';

interface Dependencies {
  configurationService: ConfigurationService;
  loggingService: LoggingService;
}

class PlanService {
  configurationService: ConfigurationService;
  loggingService: LoggingService;

  constructor({ configurationService, loggingService }: Dependencies) {
    this.configurationService = configurationService;
    this.loggingService = loggingService;

  }


  async getPlan(user: UserModel, startDate: string, endDate: string) {
    try {
      console.log(`Request for meal plan received for ${user.id} dates between: ${startDate} and ${endDate}`);

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

      return new ResponseModel(200,"success","Meal plan fetched successfully",mealPlan);

    } catch (err) {
      this.loggingService.error('Retrieving user meal plan from database', err);
      throw err;
    }
  }

  async createPlan() {
    const gender: string = 'MALE'
    const weight: number = 80 // in kg
    const height: number = 180 // in cm
    const age: number = 30 // in years
    const activityLevel: string = 'SEDENTARY' // revert to sedentary when not specified
    const deviceTrackerRollingAverageAdjustment: { [key: string]: number } | null = null // in calories / day
    const deviceTrackerDayAdjustment: { [key: string]: number } | null = null // in calories / day
    const mealsPerDay: number = 3 // 3 meals per day --> user driven if adjusted from this default
    const snacksPerDay: number = 2 // 2 snacks per day

    // when handling multiple users as part of a family, the average tdee calories for the family should be calculated, a meal plan created based on this average and a single serving size, 
    // then for each user the serving size is scaled based on their individual tdee calorie targets; the scalling shouldn't be too dramatic so that the meal plan is still realistic

    // we're also going to want to adjust this based on the users activity level as a function of time of day (e.g. more calories in the morning, less at night)
    // perhaps we recommend to user based on other datapoints
    
    // we should allow user to be able to select what meals to have planned for them
    // e.g. only meal three if three is specified as being one which user wants planned
    // structure will match that of calorieDistributionByMeal and based on the number of meals and snacks per day
    const mealPlanningPreferences: { [key: string]: any } = [
      { // meal one
        'Plan': false, // if true, then the meal is planned, if false, then the meal is not planned
        'Communial': false, // if true, then the meal is planned for the whole family, if false, then the meal is planned for the individual if planned is true
      },
      { // snack one
        'Plan': false, // if true, then the meal is planned, if false, then the meal is not planned
        'Communial': false, // if true, then the meal is planned for the whole family, if false, then the meal is planned for the individual if planned is true
      },
      { // meal two
        'Plan': false, // if true, then the meal is planned, if false, then the meal is not planned
        'Communial': false, // if true, then the meal is planned for the whole family, if false, then the meal is planned for the individual if planned is true
      },
      { // snack two
        'Plan': false, // if true, then the meal is planned, if false, then the meal is not planned
        'Communial': false, // if true, then the meal is planned for the whole family, if false, then the meal is planned for the individual if planned is true
      },
      { // meal three
        'Plan': true, // if true, then the meal is planned, if false, then the meal is not planned
        'Communial': true, // if true, then the meal is planned for the whole family, if false, then the meal is planned for the individual if planned is true
      },
    ]

    // num_meals, then num_snacks, then distributions across meals and snacks
    const calorieDistributionByMeal: { [key: string]: any } = {
      'M3S0': [ //ordered lists of meals and snacks (default ordering, 'snacks' specifically could be moved around to best fit the users preferences/needs)
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35
        },
        {
          type: 'MEAL',
          lower: 0.30,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        }
      ],
      'M3S1': [
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.30
        },
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.35
        },
        {
          type: 'SNACK',
          lower: 0.125,
          upper: 0.15
        },
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35
        },
      ],
      'M3S2': [
        {
          type: 'MEAL',
          lower: 0.20,
          upper: 0.25
        },
        {
          type: 'SNACK',
          lower: 0.125,
          upper: 0.15
        },
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.30
        },
        {
          type: 'SNACK',
          lower: 0.125,
          upper: 0.15
        },
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.30
        },
      ],
      'M4S0': [
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35
        },
        {
          type: 'MEAL',
          lower: 0.30,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        }
      ],
      'M4S1': [
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.30
        },
        {
          type: 'MEAL',
          lower: 0.25,
          upper: 0.35
        },
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35

        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'SNACK',
          lower: 0.125,
          upper: 0.15
        },

      ],
      'M5S0': [
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35
        },
        {
          type: 'MEAL',
          lower: 0.30,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        }
      ],
      'M6S0': [
        {
          type: 'MEAL',
          lower: 0.275,
          upper: 0.35
        },
        {
          type: 'MEAL',
          lower: 0.30,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        },
        {
          type: 'MEAL',
          lower: 0.325,
          upper: 0.40
        }
      ]
    };

    const days: string[] = [ 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY' ]

    // Calculate users Basal Metabolic Rate (BMR)
    function calculateBasalMetabolicRate(gender: string) {
      var bmr: number = gender == 'Male' ? 7100 : 5900
      switch (gender) {
        case 'MALE':
          bmr = 88.362 + (13.397*weight) + (4.799*height) - (5.677*age)
          break;
        case 'FEMALE':
          bmr = 447.593 + (9.247*weight) + (3.098*height) - (4.330*age)
          break;
        default:
          bmr = 447.593 + (9.247*weight) + (3.098*height) - (4.330*age) // when gender not specified revert to female bmr calculation
          break
      }
      return bmr
    }
    const bmr: number = calculateBasalMetabolicRate(gender);

    // Calculate users Total Daily Energy Expenditure (TDEE) based on activity level  (1.2 - 1.9)
    function calculateForecastedTotalDailyExpenditure(bmr: number, activityLevel: string, deviceTrackerRollingAverageAdjustment: { [key: string]: number } | null, deviceTrackerDayAdjustment: { [key: string]: number } | null ) {
      const activityFactors: { [key: string]: number } = {
        'SEDENTARY': 1.2,
        'LIGHTLY_ACTIVE': 1.375,
        'MODERATELY_ACTIVE': 1.55,
        'VERY_ACTIVE': 1.725,
        'EXTREMELY_ACTIVE': 1.9
      }
      const activityFactor: number = activityLevel != null && activityFactors.hasOwnProperty(activityLevel) ? activityFactors[activityLevel] : 1.2;
      
      const tdee: { [key: string]: number } = {} // in tdee calories / day

      let tdeeBase: number = bmr * activityFactor // base TDEE based on activity level

      if (deviceTrackerDayAdjustment == null && deviceTrackerRollingAverageAdjustment == null) {
        // No adjustments from device tracker; use base TDEE from activity level in profile
        days.forEach(day => {
          tdee[day] = tdeeBase;
        });
      } else if (deviceTrackerRollingAverageAdjustment != null) {
        days.forEach(day => {
          tdee[day] = deviceTrackerRollingAverageAdjustment[day];
        });
      } else if (deviceTrackerDayAdjustment != null) {
        days.forEach(day => {
          tdee[day] = deviceTrackerDayAdjustment[day];
        });
      }
      return tdee
    }
    const tdeeTarget: { [key: string]: number } = calculateForecastedTotalDailyExpenditure(bmr, activityLevel, deviceTrackerRollingAverageAdjustment, deviceTrackerDayAdjustment);
    
    // Build calorie distribution by meal by day object
    let calorieDistributionByMealByDay: { [key: string]: any } = {};
    days.forEach(day => {
      calorieDistributionByMealByDay[day] = [];
      calorieDistributionByMeal[`M${mealsPerDay}S${snacksPerDay}`].forEach((meal: {upperCalories: number; lowerCalories: number; upper: number; lower: number; type: string;}) => {
        meal.lowerCalories = tdeeTarget[day] * meal.lower;
        meal.upperCalories = tdeeTarget[day] * meal.upper;
        calorieDistributionByMealByDay[day].push(meal);
      })
    });

    // Based on meal planning preferences, build a list of meals and snacks to plan for each day
    const mealsToPlan = mealPlanningPreferences.map((planPref: { Plan: boolean; Communial: boolean }, index: any) => planPref.Plan ? index : -1).filter((index: number) => index !== -1);
    let mealsToPlanByDay: { [key: string]: any } = {};
    days.forEach(day => {
      mealsToPlanByDay[day] = mealsToPlan.map((index: string | number) => calorieDistributionByMealByDay[day][index]);
    });

    // Fetch recipes from edamam api for each meal to be planned using the low/high calorie bounds for each meal to help filter the results
    // Also add the meal type to the query to help filter the results
    // Also add the users dietary restrictions to the query to help filter the results
    // Also add the users allergies to the query to help filter the results
    // Also add the users preferences to the query to help filter the results
    // Also add the users dislikes to the query to help filter the results
    // Also add the users likes to the query to help filter the results
    // Randomly select three recipe options from the results (these three will be three options available to user in UI)
    




    return 
  }



}

export default PlanService;
