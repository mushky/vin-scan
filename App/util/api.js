export const api =  {

    getData: async function() {
        let loginData = await fetch("https://randomuser.me/api/?results=100&inc=name")
         .then((response) => response.json())
         .then(data => {
            console.log(data)
           return data['retrieve-agent'];
       });
       console.log('loginData ===>', loginData.agent);
       return {
         type: 'GET_AGENT_DETAILS',
         payload: loginData
       }
    },
    
    fetchVINDetail: async function() {
        fetch("https://randomuser.me/api/?results=100&inc=name")
        .then((response) => {
            const res = response.json()
            print('### response: '+res)
            return res;
        })
        .then((res) => {
            console.log('### res: ' + res)
          return res;
        })
        .catch((error) => {
          console.log("error", error);
          //alert("Sorry, something went wrong.");
        })
        // fetch("https://randomuser.me/api/?results=100&inc=name")
        // .then((response) => response.json())
        // .then((response) => {
        // })
        // .catch((error) => {
        //   console.log("error", error);
        // });  
    },
    fetchData: async function () {
        //return await fetch('https://randomuser.me/api/?results=100&inc=name');
        try {
          const response = await fetch('https://randomuser.me/api/?results=100&inc=name');
          const data =  await response.json();
          console.log(data.results);
          return data.results            
        } catch (error) {
            console.error(error);
            //console.error("it's inside error....");
            //Promise.reject(new Error("Path is required."))
        }
      },
      getMoviesFromApi: async function ()  {
        try {
          console.log("going to fetch movies...");
          const response = await fetch("https://reactnative.dev/movies.json");
          const json = await response.json();
          const movies = json.movies;
          console.log(movies);
        } catch (error) {
          console.error(error);
        }
      }
    //   getMoviesFromApiAsync: async () => {
    //     try {
    //       const response = await fetch(
    //         'https://reactnative.dev/movies.json',
    //       );
    //       const json = await response.json();
    //       console.log(json.movies)
    //       return json.movies;
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   }

}