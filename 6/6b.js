"use strict";
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
exports.__esModule = true;
var data = require("./data.js");
var testData = ["COM)B", "B)C", "C)D", "D)E", "E)F", "B)G", "G)H", "D)I", "E)J", "J)K", "K)L"];
var SpaceObject = /** @class */ (function () {
    function SpaceObject(objectName) {
        this.children = [];
        this.name = objectName;
    }
    SpaceObject.prototype.GetNumberOfDescendants = function () {
        if (this.children.length === 0) {
            return 0;
        }
        return this.children.length + this.children.map(function (child) { return child.GetNumberOfDescendants(); }).reduce(function (prev, next) {
            return prev + next;
        });
    };
    SpaceObject.prototype.GetNumberOfOrbiting = function () {
        if (this.children.length === 0) {
            return 0;
        }
        return this.GetNumberOfDescendants() + this.children.map(function (child) { return child.GetNumberOfOrbiting(); }).reduce(function (prev, next) {
            return prev + next;
        });
    };
    SpaceObject.prototype.AddChild = function (child) {
        this.children.push(child);
        child.SetParent(this);
    };
    SpaceObject.prototype.SetParent = function (parent) {
        this.parent = parent;
    };
    /**
     * @returns Distance to a child, -1 if not found
     * @param childName Name of the child to search for
     */
    SpaceObject.prototype.DistanceOfChild = function (childName) {
        if (childName === this.name) {
            return 0;
        }
        if (this.children.length === 0) {
            return -1;
        }
        var distance = -1;
        this.children.some(function (child) {
            var childDistance = child.DistanceOfChild(childName);
            if (childDistance !== -1) {
                distance = 1 + childDistance;
                return true;
            }
        });
        return distance;
    };
    SpaceObject.prototype.DistanceFrom = function (otherObjectName) {
        if (!this.parent) {
            return -1;
        }
        var distanceFromParentToObject = this.parent.DistanceOfChild(otherObjectName);
        if (distanceFromParentToObject !== -1) {
            return 1 + distanceFromParentToObject;
        }
        return 1 + this.parent.DistanceFrom(otherObjectName);
    };
    return SpaceObject;
}());
var SpaceObjectFactory = /** @class */ (function () {
    function SpaceObjectFactory() {
        this.objectsMap = [];
    }
    SpaceObjectFactory.prototype.GetObject = function (objectName) {
        if (this.objectsMap[objectName]) {
            return this.objectsMap[objectName];
        }
        var objectToReturn = new SpaceObject(objectName);
        this.objectsMap[objectName] = objectToReturn;
        return objectToReturn;
    };
    return SpaceObjectFactory;
}());
var factory = new SpaceObjectFactory();
data.forEach(function (one) {
    var _a = one.split(")"), firstString = _a[0], secondString = _a[1];
    var firstObject = factory.GetObject(firstString);
    var secondObject = factory.GetObject(secondString);
    firstObject.AddChild(secondObject);
});
// console.log(factory.objectsMap["D"].DistanceOfChild("K"));
console.log(factory.objectsMap["YOU"].parent.DistanceFrom(factory.objectsMap["SAN"].parent.name));
