const coords = [
    { lat: 37.8867, lng: -122.2978, lbl: "B" },//albany
    { lat: 44.9069, lng: -116.0999, lbl: "L" },//paradise point
    //{ lat: 43.6150, lng: -116.2023, lbl: "I" },//boise idaho
    //{ lat: 50.7374, lng: 7.0982, lbl: "B" },//bonn germany
    //{ lat: 19.4326, lng: -99.1332, lbl: "I" },//mexico city
    { lat: 18.9067, lng: -98.4253, lbl: "I" },//Atlixco Mexico
    //{ lat: 35.0116, lng: 135.7681, lbl: "B" },//kyoto
    //{ lat: -33.8688, lng: 151.2093, lbl: "B" },//sydney
    //{ lat:, lng:},
]

window.onload = function () {

    function drawMoon(ctx, rad, alt, azi, phase, ang, label) {//azi south to west,phase 0 and 1=new
        let x = -Math.sin(azi) * Math.cos(alt);
        let y = -Math.cos(azi) * Math.cos(alt);
        if (phase > 0.5) {
            phase = 1 - phase;
            ang += Math.PI;
        }
        let minor = Math.abs(Math.cos(phase * 2 * Math.PI))//width along minor axis

        let angle = Math.PI / 2 + ang;

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.ellipse(x, y, rad, rad, 0, 0, 2 * Math.PI);
        ctx.fill()

        ctx.beginPath();
        ctx.fillStyle = 'gray';
        ctx.ellipse(x, y, rad, rad, angle, 0.5 * Math.PI, -0.5 * Math.PI);
        ctx.ellipse(x, y, rad * minor, rad, angle, -0.5 * Math.PI, 0.5 * Math.PI, phase < 0.25);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = 'LightGray';
        ctx.font = '1px serif';
        let size = 1;
        ctx.scale(rad / size, -rad / size);
        ctx.fillText(label, x * size / rad, -y * size / rad);
        ctx.scale(size / rad, -size / rad);
    }
    function makeMoon(lat, long, ctx, rad, time, label) {
        let moon = SunCalc.getMoonPosition(time, lat, long);
        if (moon.altitude > 0) {
            let ill = SunCalc.getMoonIllumination(time, lat, long);
            drawMoon(ctx, rad, moon.altitude, moon.azimuth, ill.phase, ill.angle - moon.parallacticAngle, label);
            return true;
        }
        return false;
    }

    function getNextRise(time, lat, long) {
        let check = new Date(time)
        let times = SunCalc.getMoonTimes(check, lat, long);
        while (times.rise == undefined || times.rise < time) {
            check.setDate(check.getDate() + 1);
            times = SunCalc.getMoonTimes(check, lat, long);
        }
        return times.rise;
    }

    function isUp(time, lat, long) {
        return SunCalc.getMoonPosition(time, lat, long).altitude > -0.01;
    }

    function getNextMatch(time) {
        let counter = 0;
        let searching = true;
        while (searching) {
            searching = false;
            for (const { lat: lat, lng: long } of coords) {
                if (!isUp(time, lat, long)) {
                    time = getNextRise(time, lat, long);
                    searching = true;
                }
            }
            counter++;
            if (counter >= 1000) {
                return false;
            }
        }
        return time;
    }

    function render() {
        let can = document.getElementById('canvas');
        let out = document.getElementById('out');
        let ctx = can.getContext('2d');
        let rad = 0.48 * can.height;
        let ctr = 0.5 * can.height;
        ctx.setTransform(rad, 0, 0, -rad, ctr, ctr);
        ctx.clearRect(-2, -2, 4, 4);
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.5;
        ctx.ellipse(0, 0, 1, 1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, 1, 1, 0, 0, 2 * Math.PI);
        ctx.clip();
        ctx.globalAlpha = 1;
        let success = true;
        let day = new Date();
        for (const { lat: lat, lng: long, lbl: label } of coords) {
            if (!makeMoon(lat, long, ctx, 0.1, day, label)) {
                success = false;
            }
        }
        if (success) {
            out.innerText = "Shining on the ones you love"
        } else {
            let match = getNextMatch(new Date());
            if (match) {
                day.setDate(day.getDate() + 1);
                if (match > day) {
                    out.innerText = "Look up at " + match.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " on " + match.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                } else {
                    out.innerText = "Look up at " + match.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            } else {
                out.innerText = "You're further apart than the moon can see";
            }
        }

    }
    render();
    setInterval(render, 1000);
};
