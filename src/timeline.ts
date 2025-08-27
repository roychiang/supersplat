import { EventHandle } from 'playcanvas';

import { Events } from './events';

const registerTimelineEvents = (events: Events) => {
    // frames
    let frames = 180;

    const setFrames = (value: number) => {
        if (value !== frames) {
            frames = value;
            events.fire('timeline.frames', frames);
        }
    };

    events.function('timeline.frames', () => {
        return frames;
    });

    events.on('timeline.setFrames', (value: number) => {
        setFrames(value);
    });

    // frame rate
    let frameRate = 30;

    const setFrameRate = (value: number) => {
        if (value !== frameRate) {
            frameRate = value;
            events.fire('timeline.frameRate', frameRate);
        }
    };

    events.function('timeline.frameRate', () => {
        return frameRate;
    });

    events.on('timeline.setFrameRate', (value: number) => {
        setFrameRate(value);
    });

    // current frame
    let frame = 0;

    const setFrame = (value: number) => {
        if (value !== frame) {
            frame = value;
            events.fire('timeline.frame', frame);
        }
    };

    events.function('timeline.frame', () => {
        return frame;
    });

    events.on('timeline.setFrame', (value: number) => {
        setFrame(value);
    });

    // anim controls
    let animHandle: EventHandle = null;

    const play = () => {
        let time = frame;

        // handle application update tick
        animHandle = events.on('update', (dt: number) => {
            time = (time + dt * frameRate) % frames;
            setFrame(Math.floor(time));
            events.fire('timeline.time', time);
        });
    };

    const stop = () => {
        animHandle.off();
        animHandle = null;
    };

    // playing state
    let playing = false;

    const setPlaying = (value: boolean) => {
        if (value !== playing) {
            playing = value;
            events.fire('timeline.playing', playing);
            if (playing) {
                play();
            } else {
                stop();
            }
        }
    };

    events.function('timeline.playing', () => {
        return playing;
    });

    events.on('timeline.setPlaying', (value: boolean) => {
        setPlaying(value);
    });

    // keys - now managed by camera poses system

    events.function('timeline.keys', () => {
        // Get keys from the active camera pose set
        const poses = events.invoke('camera.poses');
        return poses ? poses.map((pose: any) => pose.frame) : [];
    });

    events.on('timeline.addKey', (frame: number) => {
        // Keys are now managed by camera poses, this event is fired from camera-poses.ts
        events.fire('timeline.keyAdded', frame);
    });

    events.on('timeline.removeKey', (index: number) => {
        // Keys are now managed by camera poses, this event is fired from camera-poses.ts
        events.fire('timeline.keyRemoved', index);
    });

    events.on('timeline.setKey', (index: number, frame: number) => {
        // Keys are now managed by camera poses, this event is fired from camera-poses.ts
        events.fire('timeline.keySet', index, frame);
    });

    // doc

    events.function('docSerialize.timeline', () => {
        return {
            frames,
            frameRate,
            frame
        };
    });

    events.function('docDeserialize.timeline', (data: any = {}) => {
        events.fire('timeline.setFrames', data.frames ?? 180);
        events.fire('timeline.setFrameRate', data.frameRate ?? 30);
        events.fire('timeline.setFrame', data.frame ?? 0);
    });
};

export { registerTimelineEvents };
