import bodyParser = require("body-parser");

/**
 * Renders the frames. Nice try, no answer here. 
 * Positions in meters (m).
 * Velocities in meters per second (m/s).
 * Accelerations in meters per second squared (m/s/s).
 * Masses in kilograms (kg).
 * 
 * @author David Melisso
 * @version 02/17/19
 */

const G = 1e-11; // gravitational constant. may or may not be made up.

type R2Vector = { x: number, y: number }; // a vector in two dimensions
type Frame = {
    position: R2Vector;
    velocity: R2Vector;
    mass: number;
}

class CollisionError extends Error {
    constructor() {
        super('A collision occurred.');
        this.name = 'CollisionError';
    }
}

export class Body {
    position: R2Vector;
    velocity: R2Vector;
    mass: number;

    constructor(initial_x_position: number, initial_y_position: number, initial_x_velocity: number, initial_y_velocity: number, mass: number) {
        this.position = {
            x: initial_x_position,
            y: initial_y_position,
        };

        this.velocity = {
            x: initial_x_velocity,
            y: initial_y_velocity,
        };

        this.mass = mass;        
    }

    impactOfOtherBody(body: Body): R2Vector {
        const x_distance = this.position.x - body.position.x;
        const y_distance = this.position.y - body.position.y;
        const distance = Math.sqrt(x_distance*x_distance + y_distance*y_distance);

        if (distance == 0) {
            throw new CollisionError();
        }

        const magnitude = -body.mass/(distance*distance*distance);

        return {
            x: magnitude * x_distance,
            y: magnitude * y_distance,
        };
    }

    impactOfOtherBodies(bodies: Body[]): R2Vector {
        let x_acceleration = 0;
        let y_acceleration = 0;
        for (const body of bodies) {
            try {
                const impact = this.impactOfOtherBody(body);
                x_acceleration += impact.x;
                y_acceleration += impact.y;
            }
            catch(e) {
                if (e.name = 'CollisionError') {
                    // collision occurred
                    // option: combine mass and throw out other body
                    // other option: do nothing
                }
                else {
                    throw e;
                }
            }
        }

        return {
            x: x_acceleration,
            y: y_acceleration,
        };
    }

    iterateVelocityAndPosition(x_acceleration: number, y_acceleration: number, time_change: number) {
        this.velocity.x += x_acceleration * time_change;
        this.velocity.y += y_acceleration * time_change;
        this.position.x += this.velocity.x * time_change;
        this.position.y += this.velocity.y * time_change;
    }

    toFrame() {
        let { position, velocity, mass } = this;
        position = { ... position };
        velocity = { ... velocity };
        return { position, velocity, mass };
    }
}

export function render(initial_bodies: Body[], time_interval: number, duration: number, gravitational_constant: number, number_of_frames: number): Frame[][] {
    const bodies = initial_bodies;
    const rendered_frames: Frame[][] = [];
    
    function iterateBodies() {
        const changes: R2Vector[] = [];

        // calculate all changes
        for (const i in bodies) {
            changes[i] = bodies[i].impactOfOtherBodies(bodies);   
        }

        // update using changes
        for (const i in bodies) {
            const change = changes[i];
            bodies[i].iterateVelocityAndPosition(change.x * gravitational_constant, change.y * gravitational_constant, time_interval);
        }
    }

    let current_time = 0;
    let frame_interval = duration/(number_of_frames - 1);
    let next_frame_time = 0;

    while (current_time < duration) {
        if (number_of_frames > 2 && current_time > next_frame_time) {
            const frame = Array.from(bodies).map(body => body.toFrame()); 
            rendered_frames.push(frame);
            next_frame_time += frame_interval;
        }

        iterateBodies();
        current_time += time_interval;
    }

    if (rendered_frames.length < number_of_frames) {
        rendered_frames.push(bodies.map(body => body.toFrame()));
    }

    
    return rendered_frames;
}