const audio = new Audio();

export let audioPlay = (src,loop = false)=>{
  //let audio = new Audio();
  if(loop){
	audio.loop = "loop";
  }else{
	audio.loop = false;
  }
  audio.src = src;
  audio.play();
  return audio;
};


export let getBase64 = (imgUrl)=> {
  return new Promise((resolve, reject)=>{
    let timer = setTimeout(()=>{reject()},5000);
    let xhr = new XMLHttpRequest();
    xhr.open("get", imgUrl, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status == 200) {
        let blob = this.response;
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          let base64 = e.target.result;
          resolve(base64);
        };
        oFileReader.readAsDataURL(blob);
      }
      else {
        reject();
        clearInterval(timer);
      }
    };
    xhr.send();
  });
};

//防抖
export let debounce = function(fn, delay = 300){
  var timer = null;
  return function(){
    var args = arguments;
    if(timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
