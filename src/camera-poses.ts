import { Vec3 } from 'playcanvas';

import { CubicSpline } from './anim/spline';
import { Events } from './events';

type Pose = {
    name: string,
    frame: number,
    position: Vec3,
    target: Vec3
};

interface PoseSet {
    id: number;
    name: string;
    poses: Pose[];
    active: boolean;
}

const registerCameraPosesEvents = (events: Events) => {
    // Initialize with 3 animation sets
    const poseSets: PoseSet[] = [
        { id: 1, name: 'Animation Set 1', poses: [], active: true },
        { id: 2, name: 'Animation Set 2', poses: [], active: false },
        { id: 3, name: 'Animation Set 3', poses: [], active: false }
    ];

    let activeSetId = 1;

    const getActiveSet = (): PoseSet => {
        return poseSets.find(set => set.id === activeSetId) || poseSets[0];
    };

    const getPoses = (): Pose[] => {
        return getActiveSet().poses;
    };

    let onTimelineChange: (frame: number) => void;

    const rebuildSpline = () => {
        const duration = events.invoke('timeline.frames');
        const poses = getPoses();

        const orderedPoses = poses.slice()
        // filter out keys beyond the end of the timeline
        .filter(a => a.frame < duration)
        // order keys by time for spline
        .sort((a, b) => a.frame - b.frame);

        // construct the spline points to be interpolated
        const times = orderedPoses.map(p => p.frame);
        const points = [];
        for (let i = 0; i < orderedPoses.length; ++i) {
            const p = orderedPoses[i];
            points.push(p.position.x, p.position.y, p.position.z);
            points.push(p.target.x, p.target.y, p.target.z);
        }

        if (orderedPoses.length > 1) {
            // interpolate camera positions and camera target positions
            const spline = CubicSpline.fromPointsLooping(duration, times, points, -1);
            const result: number[] = [];
            const pose = { position: new Vec3(), target: new Vec3() };

            // handle application update tick
            onTimelineChange = (frame: number) => {
                const time = frame;

                // evaluate the spline at current time
                spline.evaluate(time, result);

                // set camera pose
                pose.position.set(result[0], result[1], result[2]);
                pose.target.set(result[3], result[4], result[5]);
                events.fire('camera.setPose', pose, 0);
            };
        } else {
            onTimelineChange = null;
        }
    };

    events.on('timeline.time', (time: number) => {
        onTimelineChange?.(time);
    });

    events.on('timeline.frame', (frame: number) => {
        onTimelineChange?.(frame);
    });

    const addPose = (pose: Pose) => {
        if (pose.frame === undefined) {
            return false;
        }

        const poses = getPoses();
        // if a pose already exists at this time, update it
        const idx = poses.findIndex(p => p.frame === pose.frame);
        if (idx !== -1) {
            poses[idx] = pose;
        } else {
            poses.push(pose);
            events.fire('timeline.addKey', pose.frame);
        }

        rebuildSpline();
    };

    const removePose = (index: number) => {
        const poses = getPoses();
        poses.splice(index, 1);

        // remove the timeline key
        rebuildSpline();
        events.fire('timeline.removeKey', index);
    };

    const movePose = (index: number, frame: number) => {
        const poses = getPoses();
        // remove target frame pose
        const toIndex = poses.findIndex(p => p.frame === frame);
        if (toIndex !== -1) {
            removePose(toIndex);
        }

        // move pose
        poses[index].frame = frame;
        rebuildSpline();
        events.fire('timeline.setKey', index, frame);
    };

    // Animation set management functions
    const switchAnimationSet = (setId: number) => {
        if (setId >= 1 && setId <= 3) {
            activeSetId = setId;
            poseSets.forEach((set) => {
                set.active = set.id === setId;
            });
            rebuildSpline();
            events.fire('camera.animationSetChanged', setId);
        }
    };

    events.function('camera.poses', () => {
        return getPoses();
    });

    events.function('camera.poseSets', () => {
        return poseSets;
    });

    events.function('camera.activeSetId', () => {
        return activeSetId;
    });

    events.on('camera.switchAnimationSet', (setId: number) => {
        switchAnimationSet(setId);
    });

    events.function('camera.allPoseSets', () => {
        const result: { [key: string]: Pose[] } = {};
        poseSets.forEach((set, index) => {
            result[`set${index}`] = set.poses;
        });
        return result;
    });

    events.on('camera.addPose', (pose: Pose) => {
        addPose(pose);
    });

    events.on('timeline.add', (frame: number) => {
        // get the current camera pose
        const pose = events.invoke('camera.getPose');
        const poses = getPoses();

        addPose({
            name: `camera_${poses.length}`,
            frame,
            position: pose.position,
            target: pose.target
        });
    });

    events.on('timeline.move', (frameFrom: number, frameTo: number) => {
        if (frameFrom === frameTo) return;

        const poses = getPoses();
        const index = poses.findIndex(p => p.frame === frameFrom);
        if (index !== -1) {
            movePose(index, frameTo);
        }
    });

    events.on('timeline.remove', (index: number) => {
        removePose(index);
    });

    events.on('timeline.frames', () => {
        rebuildSpline();
    });

    // doc

    events.function('serialize', (filename: string) => {
        if (filename === 'poseSets') {
            const result: any = {};
            poseSets.forEach((set) => {
                result[`set${set.id - 1}`] = set.poses.map(pose => ({
                    name: pose.name,
                    frame: pose.frame,
                    position: [pose.position.x, pose.position.y, pose.position.z],
                    target: [pose.target.x, pose.target.y, pose.target.z]
                }));
            });
            // Store active set ID for restoration
            result.activeSetId = activeSetId;
            return result;
        }
    });

    events.function('deserialize', (filename: string, data: any) => {
        if (filename === 'poseSets' && data) {
            // Clear all pose sets
            poseSets.forEach((set) => {
                set.poses.length = 0;
            });

            // Load pose sets from data
            for (let i = 0; i < 3; i++) {
                const setKey = `set${i}`;
                if (data[setKey]) {
                    const poseData = data[setKey];
                    const targetSet = poseSets[i];
                    if (targetSet) {
                        poseData.forEach((pose: any) => {
                            targetSet.poses.push({
                                name: pose.name,
                                frame: pose.frame,
                                position: new Vec3(pose.position[0], pose.position[1], pose.position[2]),
                                target: new Vec3(pose.target[0], pose.target[1], pose.target[2])
                            });
                        });
                    }
                }
            }

            // Restore active set ID if available, otherwise default to 1
            if (data.activeSetId && data.activeSetId >= 1 && data.activeSetId <= 3) {
                switchAnimationSet(data.activeSetId);
            } else {
                switchAnimationSet(1);
            }

            rebuildSpline();
        }
    });

    // Document serialization for multiple pose sets
    events.function('docSerialize.poseSets', (): any[] => {
        const pack3 = (v: Vec3) => [v.x, v.y, v.z];

        const result: any[] = [];
        poseSets.forEach((set, index) => {
            if (set.poses.length > 0) {
                result.push({
                    name: `set${index}`,
                    poses: set.poses.map((pose) => {
                        return {
                            name: pose.name,
                            frame: pose.frame,
                            position: pack3(pose.position),
                            target: pack3(pose.target)
                        };
                    })
                });
            }
        });

        // If no poses exist, return empty array
        if (result.length === 0) {
            return [];
        }

        // Add metadata about active set
        result.push({
            name: 'metadata',
            activeSetId: activeSetId
        });

        return result;
    });

    events.function('docDeserialize.poseSets', (docPoseSets: any[]) => {
        if (!docPoseSets || docPoseSets.length === 0) {
            return;
        }

        // Clear all pose sets
        poseSets.forEach((set) => {
            set.poses.length = 0;
        });

        const fps = events.invoke('timeline.frameRate');
        let restoredActiveSetId = 1;

        docPoseSets.forEach((docSet: any) => {
            if (docSet.name === 'metadata') {
                restoredActiveSetId = docSet.activeSetId || 1;
                return;
            }

            // Parse set index from name (set0, set1, set2)
            const setIndex = parseInt(docSet.name.replace('set', ''), 10);
            if (setIndex >= 0 && setIndex < 3 && poseSets[setIndex]) {
                docSet.poses.forEach((docPose: any, index: number) => {
                    poseSets[setIndex].poses.push({
                        name: docPose.name,
                        frame: docPose.frame ?? (index * fps),
                        position: new Vec3(docPose.position),
                        target: new Vec3(docPose.target)
                    });
                });
            }
        });

        // Restore active set
        switchAnimationSet(restoredActiveSetId);
        rebuildSpline();
    });
};

export { registerCameraPosesEvents, Pose };
