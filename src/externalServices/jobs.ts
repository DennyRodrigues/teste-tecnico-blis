import { Job } from "@/types/job";
import axios from "axios";

const ADZUNA_API_URL = process.env.BASE_URL_ADZUNA;
const COUNTRY = "gb";
const APP_ID = process.env.API_ID_ADZUNA;
const APP_KEY = process.env.API_KEY_ADZUNA;

/**
 * Fetch jobs based on user-provided abilities.
 * @param abilities - List of abilities provided by the user.
 * @param page - Page number for pagination (default is 1).
 * @param resultsPerPage - Number of results per page (default is 10).
 * @returns Promise<Job[]> - A list of jobs matching the abilities.
 */
export const findJobsByAbilities = async (
  abilities: string[],
  page: number = 1,
  resultsPerPage: number = 10
): Promise<Job[]> => {
  try {
    const query = abilities.join(" ");
    console.log(ADZUNA_API_URL, APP_KEY, APP_ID);

    const url = `${ADZUNA_API_URL}/jobs/${COUNTRY}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&what_or=${query}&results_per_page=${resultsPerPage}`;
    // const response = await axios.get(
    //   `${ADZUNA_API_URL}/${COUNTRY}/search/${page}`,
    //   {
    //     params: {
    //       app_id: APP_ID,
    //       app_key: APP_KEY,
    //       what_or: query,
    //       results_per_page: resultsPerPage,
    //     },
    //   }
    // );
    const response = await axios.get(url);

    const jobs: Job[] = response.data.results;

    if (jobs.length === 0) {
      console.log("No jobs found matching the given abilities.");
      return [];
    }

    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};
