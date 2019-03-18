function SimClient(simdata,send){
    
    //sort all data by date & time
    this.simdata = simdata.sort((d1,d2)=>{
        let t1 = new Date(d1.tpep_pickup_datetime).getTime(),
        t2 = new Date(d2.tpep_pickup_datetime).getTime();
        return t1-t2;
    });
    this.send = send;
    this.send('sending requests')
}
SimClient.prototype.run = function(){
    //min time
    const now = new Date(this.simdata[1].tpep_pickup_datetime);

    for(let record in this.simdata){
        let date = new Date(this.simdata[record].tpep_pickup_datetime);
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        let year = 1900+now.getYear();
        let month = now.getMonth();
        let day = now.getDate();
        let newtime = new Date(year,month, day,hour,minute,second);
        let timeout = newtime.getTime()-now.getTime();
        if(timeout<0)continue;
        setTimeout(() => {
            //request
            console.log('new request: '+this.simdata[record]);
        }, timeout);
    }
}

module.exports = SimClient