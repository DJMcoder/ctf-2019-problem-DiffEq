import express from 'express';
import * as path from 'path';
import { Body, render } from './helpers/render';

const app = express();
const PORT = 80;


app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'static/index.html'));
});

app.post('/render', express.json(), function (request, response) {
    const { initial_bodies, time_interval, duration, gravitational_constant, number_of_frames } = request.body;
    const bodies: Body[] = [];

    if (!Array.isArray(initial_bodies)) {
        response.status(400).send('Data formatted incorrectly; initial_bodies should be array.');
        return;
    }

    console.log(request.body)

    const inputs: any = {};
    for (const property of Object.keys(request.body)) {
        console.log(request.body[property])
        inputs[property] = eval(request.body[property]);
    }

    let i = 0;
    for (const body_info of initial_bodies) {
        const isValid = typeof body_info.position != 'undefined' &&
                        typeof body_info.velocity != 'undefined' &&
                        typeof body_info.position.x == 'number' &&
                        typeof body_info.position.y == 'number' &&
                        typeof body_info.velocity.x == 'number' &&
                        typeof body_info.velocity.y == 'number' &&
                        typeof body_info.mass       == 'number';
        
        if (!isValid) {
            response.status(400).send(`Data formatted incorrectly; the body at position ${i} is not a valid body.`);
            return;
        }

        bodies.push(new Body(body_info.position.x, body_info.position.y, body_info.velocity.x, body_info.velocity.y, body_info.mass));
        i++;
    }

    if (typeof time_interval != 'number') {
        response.status(400).send('Data formatted incorrectly, time_interval should be a number.');
        return;
    }

    if (typeof duration != 'number') {
        response.status(400).send('Data formatted incorrectly, duration should be a number.');
        return;
    }

    if (typeof gravitational_constant != 'number') {
        response.status(400).send('Data formatted incorrectly, gravitational_constant should be a number.');
        return;
    }

    if (typeof number_of_frames != 'number') {
        response.status(400).send('Data formatted incorrectly, number_of_frames should be a number.');
        return;
    }

    const rendered_frames = render(bodies, time_interval, duration, gravitational_constant, number_of_frames);
    response.json({ rendered_frames, inputs });
});

app.use(express.static('static'));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});