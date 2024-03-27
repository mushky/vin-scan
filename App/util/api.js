export const api =  {
      fetchCarDetailFromAPI: async function(value) {
        try {
          const response = await fetch(
            `https://api.api-ninjas.com/v1/vinlookup?vin=${value}`,
            {
              method: "GET",
              headers: new Headers({
                "X-Api-Key": "hqCrlYgoMZN7erSy1+qjpA==FNqgB7SOfEFbRwJg",
              }),
            }
          );

          return response.json();
        } catch (error) {
          console.error(error);
        } 
      },

}