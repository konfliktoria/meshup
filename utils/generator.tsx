export class Matcher {
  private scoreGrid: number[][]
  private groupSize: number
  private bestScore: number
  private bestMatches: Array<Array<Array<number>>>

  static match(scoreGrid:number[][], groupSize: number): Array<Array<Array<number>>> {
    return new Matcher(scoreGrid, groupSize).match()
  }

  private constructor(scoreGrid:number[][], groupSize: number) {
    this.scoreGrid = scoreGrid
    this.groupSize = groupSize
    this.bestScore = Number.POSITIVE_INFINITY
    this.bestMatches = new Array()
  }

  private match(): Array<Array<Array<number>>> {
    var allIndices = new Array(this.scoreGrid.length).fill(0).map((_, i:number) => i)
    this.matchRecursive(allIndices, [], 0)
    return this.bestMatches
  }

  private computeGroupSizes(remainingMembers: number): Iterable<number> {
    if (remainingMembers % this.groupSize == 0) {
      return [this.groupSize]
    } else if (this.groupSize == 2) {
      return [2, 3]
    } else {
      // return [] // TODO
      throw new Error("not implemented")
    }
  }

  private matchRecursive(remIndices: Array<number>, partialMatch: Array<Array<number>>, partialScore: number) {
    // console.log("matchRecursive(%s, %s, %s)", remIndices, partialMatch.map(group => `(${group.join(', ')})`).join(" | "), partialScore)
    const groupSizes = this.computeGroupSizes(remIndices.length)
    for (const groupSize of groupSizes) {
      const maxGroupIndex = groupSize - 1
      const currGroup = new Array<number>(groupSize)
      currGroup[0] = remIndices.length - 1
      currGroup[1] = currGroup[0]
      for (var i = 1; i >= 1;) {
        const currValue = --currGroup[i]
        if (currValue >= maxGroupIndex - i) {
          // the current group value can be part of a valid group
          if (i == maxGroupIndex) {
            // base case, group has been fully populated
            let currScore = partialScore + this.computeScore(remIndices, currGroup)
            if (currScore > this.bestScore) {
              // console.log("Skipping group %s due to bad score (%d > %d)", currGroup, currScore, this.bestScore)
              continue
            }
            const resolvedGroup = currGroup.map(v => remIndices[v])
            const currMatch = partialMatch.concat([resolvedGroup])
            if (remIndices.length == resolvedGroup.length) {
              if (currScore < this.bestScore) {
                this.bestScore = currScore
                this.bestMatches = new Array()
              }
              this.bestMatches.push(currMatch)
              console.log("%s -> %d", currMatch.map(group => `(${group.join(', ')})`).join(" | "), currScore)
            } else {
              this.matchRecursive(remIndices.filter(v => !resolvedGroup.includes(v)), currMatch, currScore)
            }
          } else {
            // initialize the member to the right, travel to the right
            currGroup[++i] = currValue
          }
        } else {
          // value is invalid, travel left (and break if we are i == 0)
          i--
        }
      }
    }
  }

  private computeScore(indices: Array<number>, group: Array<number>): number {
    let result = 0
    for (let i = group.length - 1; i >= 1; i--) {
      for (let j = i - 1; j >= 0; j--) {
        result += this.lookupScore(indices[group[j]], indices[group[i]])
      }
    }
    return result
  }

  private lookupScore(p1: number, p2: number): number {
    return this.scoreGrid[this.scoreGrid.length - 1 - p1][p2]
  }
}

export class TeamMatcher {
  private labels:string[];
  private count:number;
  private fam:number[][];

  constructor(labels: string[], connectedness: number[][]) {
    this.labels = labels
    this.count = labels.length
    // this.fam = new Array(this.count - 1).fill(0).map((_, i:number) => new Array(this.count - i - 1).fill(0))
    // this.fam = new Array(this.count - 1).fill(0).map((_, i:number) => new Array(this.count - i - 1).fill(0).map((_, j) => i * 10 + j))
    this.fam = Object.assign([], connectedness.map(row => Object.assign([], row)))
  }

  public match(groupSize: number): Array<Array<Array<String>>> {
    const matchedIndices = Matcher.match(this.fam, groupSize)
    return matchedIndices.map(m => m.map(g => g.map(i => this.labels[i])))
  }

  public print() {
    console.log(this.fam)
  }
}

/*

let people = ["Michael", "Mathias", "Anselm", "Dominik", "Jan", "Noli", "Thomas"]

var m = new Team(people)
m.print()
const matches = m.match(2)

for (const match of matches) {
  console.log(match)
}
*/
