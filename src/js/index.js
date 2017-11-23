const GRAPH_SIZE = {width: 10, height: 10}
const BLUE = 0
const RED = 1

export class SimpleNeuralNetwork {
  constructor () {
    const canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 500

    document.querySelector('#canvas').appendChild(canvas)
    this.canvas = canvas
    this.dataSetTextArea = document.querySelector('#dataSet')
    this.trainIterationInput = document.querySelector('#trainIteration')
    this.trainIterationCount = document.querySelector('#trainIterationCount')
    this.targetDataSet = document.querySelector('#targetDataSet')
    this.autoTrainCheckElem = document.querySelector('#autoTrain')

    this.autoTrainCheckElem.onchange = () => {
      if (this.autoTrainCheckElem.checked) {
        this.runDemo()
      } else {
        window.cancelAnimationFrame(this.demo)
      }
    }
    this.trainIterationInput.oninput = () => this.run()
  }

  getDataSet () {
        // const dataB1 = [1, 1, 0];
        // const dataB2 = [2, 1, 0];
        // const dataB3 = [2, .5, 0];
        // const dataB4 = [3, 1, 0];

        // const dataR1 = [3, 1.5, 1];
        // const dataR2 = [3.5, .5, 1];
        // const dataR3 = [4, 1.5, 1];
        // const dataR4 = [5.5, 1, 1];

        // return [dataB3, dataB4, dataR1, dataR2, dataR3, dataR4, dataB1, dataB2];

    return JSON.parse(this.dataSetTextArea.value)
  }

  getUnkownData () {
        // unknown type (data we want to find)
        // [4.5,  1, "it should be 1"];
    return JSON.parse(this.targetDataSet.value)
  }

  sigmoid (x) {
    return 1 / (1 + Math.exp(-x))
  }

  trainData (dataSet, trainIterationCount) {
    const learningRate = 0.2
    let w1 = Math.random() * 0.2 - 0.1
    let w2 = Math.random() * 0.2 - 0.1
    let b = Math.random() * 0.2 - 0.1

    for (let iteration = 0; iteration < trainIterationCount; iteration++) {
          // pick a random point
      const randomIdx = Math.floor(Math.random() * dataSet.length)
      const point = dataSet[randomIdx]
      const target = point[2] // target stored in 3rd coord of points

          // feed forward
      const z = w1 * point[0] + w2 * point[1] + b
      const pred = this.sigmoid(z)

          // now we compare the model prediction with the target
      const cost = (pred - target) ** 2

          // now we find the slope of the cost w.r.t. each parameter (w1, w2, b)
          // bring derivative through square function
      const dcost_dpred = 2 * (pred - target)

          // bring derivative through sigmoid
          // derivative of sigmoid can be written using more sigmoids! d/dz sigmoid(z) = sigmoid(z)*(1-sigmoid(z))
      const dpred_dz = this.sigmoid(z) * (1 - this.sigmoid(z))

          // I think you forgot these in your slope calculation?
      const dz_dw1 = point[0]
      const dz_dw2 = point[1]
      const dz_db = 1

          // now we can get the partial derivatives using the chain rule
          // notice the pattern? We're bringing how the cost changes through each function, first through the square, then through the sigmoid
          // and finally whatever is multiplying our parameter of interest becomes the last part
      const dcost_dw1 = dcost_dpred * dpred_dz * dz_dw1
      const dcost_dw2 = dcost_dpred * dpred_dz * dz_dw2
      const dcost_db = dcost_dpred * dpred_dz * dz_db

          // now we update our parameters!
      w1 -= learningRate * dcost_dw1
      w2 -= learningRate * dcost_dw2
      b -= learningRate * dcost_db
    }

    return {w1, w2, b}
  }

  toScreen (x, y) {
    return {
      x: (x / GRAPH_SIZE.width) * this.canvas.width,
      y: -(y / GRAPH_SIZE.height) * this.canvas.height + this.canvas.height
    }
  }

    // map points from screen coordinates to the graph
  toGraph (x, y) {
    return {
      x: x / this.canvas.width * GRAPH_SIZE.width,
      y: GRAPH_SIZE.height - y / this.canvas.height * GRAPH_SIZE.height
    }
  }

  drawGrid (ctx) {
    ctx.font = 'Helvetica'
    ctx.strokeStyle = '#AAAAAA'

    for (let j = 0; j <= GRAPH_SIZE.width; j++) {
            // x lines
      ctx.beginPath()
      let p = this.toScreen(j, 0)
      ctx.moveTo(p.x, p.y)
      p = this.toScreen(j, GRAPH_SIZE.height)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()

            // y lines
      ctx.beginPath()
      p = this.toScreen(0, j)
      ctx.moveTo(p.x, p.y)
      p = this.toScreen(GRAPH_SIZE.width, j)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
  }

  drawPoints (ctx, dataSet, unkownData) {
    // unknown
    const pointSize = 8
    let p = this.toScreen(unkownData[0], unkownData[1])

    ctx.fillStyle = '#00AA00'
    ctx.fillText('Unknown', p.x - 18, p.y - 5)
    ctx.fillRect(p.x - pointSize / 2, p.y - pointSize / 2, pointSize, pointSize)

    dataSet.forEach(([x, y, color]) => {
      ctx.fillStyle = color === BLUE ? '#0000FF' : '#FF0000'

      p = this.toScreen(x, y)
      ctx.fillRect(p.x - pointSize / 2, p.y - pointSize / 2, pointSize, pointSize)
    })
  }

  visualizeTrainedData (trainedData, canvas) {
    const ctx = canvas.getContext('2d')
    const stepSize = 0.05
    const boxSize = canvas.width / (GRAPH_SIZE.width / stepSize)

    ctx.save()
    ctx.globalAlpha = 0.2

    for (let xx = 0; xx < GRAPH_SIZE.width; xx += stepSize) {
      for (let yy = 0; yy < GRAPH_SIZE.height; yy += stepSize) {
        let modelOut = this.sigmoid(xx * trainedData.w1 + yy * trainedData.w2 + trainedData.b)
        if (modelOut < 0.5) {
          // blue
          ctx.fillStyle = '#0000FF'
        } else {
          // red
          ctx.fillStyle = '#FF0000'
        }
        let p = this.toScreen(xx, yy)
        ctx.fillRect(p.x, p.y, boxSize, boxSize)
      }
    }
    ctx.restore()
  }

  run (trainIterationCount = document.querySelector('#trainIteration').value) {
    this.trainIterationCount.innerHTML = trainIterationCount
    this.trainIterationInput.value = trainIterationCount

    const dataSet = this.getDataSet()
    const ctx = this.canvas.getContext('2d')
    const trainedData = this.trainData(dataSet, trainIterationCount)
    const unkownData = this.getUnkownData()
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawGrid(ctx)
    this.drawPoints(ctx, dataSet, unkownData)
    this.visualizeTrainedData(trainedData, this.canvas)
  }

  runDemo () {
    const trainIteration = this.trainIterationInput
    const step = parseInt(trainIteration.step)
    const max = parseInt(trainIteration.max)

    let interation = parseInt(trainIteration.min)
    const demoFrame = () => {
      this.run(interation)

      interation += step
      if (interation >= max || !this.autoTrainCheckElem.checked) {
        window.cancelAnimationFrame(this.demo)
      } else {
        window.requestAnimationFrame(demoFrame)
      }
    }
    this.demo = window.requestAnimationFrame(demoFrame)
  }
}

(new SimpleNeuralNetwork()).run()
