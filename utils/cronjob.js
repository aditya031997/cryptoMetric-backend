const cron =require("cron")
const saveData=async()=>{
    try{
    
console.log("CronJob Working Datasaved Sucessfuly at",new Date())
 }catch(error){
    console.log(error)
 }
const job = new cron.CronJob('*/2 * * * *',async ()=>{
await saveData()
})
}

module.exports=
saveData
