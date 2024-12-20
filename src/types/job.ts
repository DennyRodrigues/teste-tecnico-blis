export type Job = {
  title: string;
  location: {
    display_name: string;
  };
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  redirect_url: string;
};
