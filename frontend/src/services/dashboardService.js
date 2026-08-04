

const dashboardService={


// getBadHubbitsStatus :
async  getBadHubbitsStatus (){
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/day-goals';
  const response = await fetch(`${apiUrl}/dashboard/bad-habits`,{
        headers:{
            'Content-Type': 'application/json',
        },
        method: 'GET'
    })
    const data = await response.json();
   return data.data;
}

}
export default dashboardService;