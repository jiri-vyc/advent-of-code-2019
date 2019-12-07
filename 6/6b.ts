/*
--- Part Two ---
Now, you just need to figure out how many orbital transfers you (YOU) need to take to get to Santa (SAN).

You start at the object YOU are orbiting; your destination is the object SAN is orbiting. An orbital transfer lets you move from any object to an object orbiting or orbited by that object.

For example, suppose you have the following map:

COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN
Visually, the above map of orbits looks like this:

                          YOU
                         /
        G - H       J - K - L
       /           /
COM - B - C - D - E - F
               \
                I - SAN
In this example, YOU are in orbit around K, and SAN is in orbit around I. To move from K to I, a minimum of 4 orbital transfers are required:

K to J
J to E
E to D
D to I
Afterward, the map of orbits looks like this:

        G - H       J - K - L
       /           /
COM - B - C - D - E - F
               \
                I - SAN
                 \
                  YOU
What is the minimum number of orbital transfers required to move from the object YOU are orbiting to the object SAN is orbiting? (Between the objects they are orbiting - not between YOU and SAN.)
*/

import * as data from "./data.js";
const testData = ["COM)B","B)C","C)D","D)E","E)F","B)G","G)H","D)I","E)J","J)K","K)L"];

class SpaceObject {
    public children: SpaceObject[];
    public parent: SpaceObject;
    private name: string;
    public constructor(objectName: string){
        this.children = [];
        this.name = objectName;
    }
    public GetNumberOfDescendants(): number {
        if (this.children.length === 0){
            return 0;
        }
        return this.children.length + this.children.map((child) => child.GetNumberOfDescendants()).reduce((prev, next) => {
            return prev + next;
        });
    }
    public GetNumberOfOrbiting(): number {
        if (this.children.length === 0){
            return 0;
        }
        return this.GetNumberOfDescendants() + this.children.map((child) => child.GetNumberOfOrbiting()).reduce((prev, next) => {
            return prev + next;
        });
    }
    public AddChild(child: SpaceObject): void {
        this.children.push(child);
        child.SetParent(this);
    }
    public SetParent(parent: SpaceObject): void {
           this.parent = parent;
    }
    /**
     * @returns Distance to a child, -1 if not found
     * @param childName Name of the child to search for
     */
    public DistanceOfChild(childName: string): number {
           if (childName === this.name) {
                  return 0;
           }
           if (this.children.length === 0){
                  return -1;
           }
           let distance = -1;
           this.children.some((child) => {
                  const childDistance = child.DistanceOfChild(childName);
                  if (childDistance !== -1){
                         distance = 1 + childDistance;
                         return true;
                  }
           });
           return distance;
    }
    /**
     * @returns Distance to the other object, undefined behaviour when the object doesn't exist in graph (TODO)
     * @param otherObjectName Name of other object to calculate distance to
     */
    public DistanceFrom(otherObjectName: string): number {
           if (!this.parent) {
                  return -1;
           }
           const distanceFromParentToObject = this.parent.DistanceOfChild(otherObjectName);
           if (distanceFromParentToObject !== -1) {
                  return 1 + distanceFromParentToObject;
           }
           return 1 + this.parent.DistanceFrom(otherObjectName);
    }
}

class SpaceObjectFactory {
    public objectsMap = [];
    public GetObject(objectName: string): SpaceObject {
        if (this.objectsMap[objectName]){
            return this.objectsMap[objectName];
        }
        const objectToReturn = new SpaceObject(objectName);
        this.objectsMap[objectName] = objectToReturn;
        return objectToReturn;
    }
}

const factory = new SpaceObjectFactory();

// Construct the graph
data.forEach((one) => {
    const [firstString, secondString] = one.split(")");
    const firstObject = factory.GetObject(firstString);
    const secondObject = factory.GetObject(secondString);
    firstObject.AddChild(secondObject);
});

console.log(factory.objectsMap["YOU"].parent.DistanceFrom(factory.objectsMap["SAN"].parent.name));

