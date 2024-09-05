import { onMount } from "solid-js";

let App = () => {
  let canvas: HTMLCanvasElement;
  let isMouseDown = false;

  let hue = Math.random() * 360;

  let lastMouseX = 0;
  let lastMouseY = 0;

  onMount(() => {
    let ctx = canvas.getContext('2d')!;
    let ws = new WebSocket('wss://draw-ws.phaz.uk');

    ws.onopen = () => {
      console.log('Opened');
      ws.send(JSON.stringify({ type: 'auth', hue }));
    }

    ws.onmessage = ( msg ) => {
      let json = JSON.parse(msg.data);

      if(json.type === 'draw'){
        ctx.strokeStyle = `hsl(${json.hue}, 100%, 50%)`;

        ctx.beginPath();
        ctx.moveTo(json.from[0], json.from[1]);
        ctx.lineTo(json.to[0], json.to[1]);
        ctx.stroke();
        ctx.closePath();
      }
    }

    window.onmousedown = () => isMouseDown = true;
    window.onmouseup = () => isMouseDown = false;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.onmousemove = ( e ) => {
      if(isMouseDown){
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;

        ws.send(JSON.stringify({
          type: 'draw',
          from: [ lastMouseX, lastMouseY ],
          to: [ e.clientX, e.clientY ]
        }));

        ctx.beginPath();
        ctx.moveTo(lastMouseX, lastMouseY);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.closePath();
      }

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }

    let render = () => {
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  })

  return (
    <div>
      <canvas ref={canvas!}></canvas>
    </div>
  )
}

export default App