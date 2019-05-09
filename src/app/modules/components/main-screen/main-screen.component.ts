import { Component, OnInit } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.css']
})
export class MainScreenComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  travelling: boolean = false;
  pending = new Array();
  processing = new Array();
  public currentDirn: any = 0;
  public currentFloor: any = 1;
  currentCapacity:any = 0;
  maxCapacity:any = 8;

  //pause execution
  sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e10; i++) {
      
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  }

  //handle button click events
  control(event) {
    let target = event.target || event.srcElement || event.currentTarget;
    let idAttr = target.attributes.id;
    let eleId = idAttr.nodeValue;
    var reqFloor, reqDirn;
    if (!isNaN(eleId)){
      var text = document.getElementById('floor');
      text.setAttribute('value',eleId);
      reqFloor = eleId;
    }
    else if (eleId == "up" || eleId=="down"){
      var text = document.getElementById('dirn');
      text.setAttribute('value', eleId);
      reqDirn = eleId=="up"?1:0;
    }
    else{
      reqDirn = document.getElementById('dirn').getAttribute('value');
      reqFloor = document.getElementById('floor').getAttribute('value');
      if(reqDirn==null || reqFloor==null  ){
        console.log('Invalid Request');
        return;
      }
      let job={
        'reqFloor': parseInt(reqFloor),
        'reqDirn': reqDirn=="up"?1:0,
      }
      console.log('Processing Request');
      this.pending.push(job);
      this.travelling = true;
      while(this.pending.length>0){
        this.processRequests();
      }
      this.travelling = false;
    }
  }

  processRequests(){
    this.sweepThrough();
  }

  sweepThrough(){
    console.log('Current Floor - ', this.currentFloor);
    let waited = false;
    this.travelling = true;


    //pick any person if any waiting from the current floor
    for (let i = 0; i < this.processing.length; i++) {
      if (this.currentFloor == this.processing[i].reqFloor && this.currentCapacity < this.maxCapacity) {
        if(!waited){
          this.stopAndWait();
          waited = true;
        }
        this.currentCapacity++;
        this.processing.splice(i,1);
      }
    }

    //service from common pending queue
    for (let i = 0; i < this.pending.length; i++) {
      if (this.currentFloor == this.pending[i].reqFloor) {
        if(!waited){
          this.stopAndWait();
          waited = true;
        }
        this.processing.push(this.pending[i]);
        this.pending.splice(i,1);
        console.log('Serviced...');

      }
    }
    
    //To check if any other request are pending in the direction in which elevator is moving
    let moreReq = false;
    for(let i=0;i<this.pending.length;i++){
      if(this.currentDirn == 1){
        if (this.pending[i].reqFloor > this.currentFloor) {
          moreReq = true;
        }
      }
      else{
        if (this.pending[i].reqFloor < this.currentFloor) {
          moreReq = true;
        }
      }
    }
    for (let i = 0; i < this.processing.length; i++) {
      if (this.currentDirn == 1) {
        if (this.processing[i].reqFloor > this.currentFloor) {
          moreReq = true;
        }
      }
      else {
        if (this.processing[i].reqFloor < this.currentFloor) {
          moreReq = true;
        }
      }
    }

    //continue moving in same direction if more requests exist in this direction
    if(moreReq){
      if(this.currentDirn == 1){
        this.travel()
        this.currentFloor+=1;
        document.getElementById('currentFloorId').innerHTML = this.currentFloor;
        document.getElementById('currentDirnId').innerHTML = this.currentDirn == 1 ? "UP" : "DOWN";
        this.sweepThrough();
      }
      else{
        this.travel();
        this.currentFloor-=1;
        document.getElementById('currentFloorId').innerHTML = this.currentFloor;
        document.getElementById('currentDirnId').innerHTML = this.currentDirn == 1 ? "UP" : "DOWN";
        this.sweepThrough();
      }
    }
    //change direction if no more requests in this direction but some requests in other directions
    else if(this.pending.length > 0 || this.processing.length > 0){
      this.currentDirn = !this.currentDirn;
      this.sweepThrough();
    }
    //return if no more requests
    else{
      return;
    }
  }

  stopAndWait(){
    this.sleep(500);
    //stop and keep doors open for 0.5 seconds.
  }

  travel(){
    this.sleep(500);
    //travel time between floors assumed 0.5 seconds.
  }
}
