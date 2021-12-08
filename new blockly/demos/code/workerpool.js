const path = require('path');
const { Worker } = require('worker_threads');
class WorkerPool {
    _workers = [];                    // 線程引用數組
    _activeWorkers = [];              // 激活的線程數組
    _queue = [];                      // 任務隊列
    constructor(numOfThreads, allcode) {
        // this.workerPath = workerPath;
        this.numOfThreads = numOfThreads;
        this.allcode = allcode ;
        this.init();
    }
    // 初始化多線程
    init() {
        if (this.numOfThreads < 1) {
        throw new Error('線程池最小線程數應為1');
        }
        for (let i = 0;i < this.numOfThreads; i++) {
            // onsole.log( this.numOfThreads + "test" ) ;
            // console.log(  this.allcode[i].script + "test" + i + "\n" ) ;
            const worker = new Worker( this.allcode[i].script + 'console.log(\'sucessssssss\') ;', { eval:true } ) ;
            this._workers[i] = worker;
            this._activeWorkers[i] = false;
        }
    }
    // 結束線程池中所有線程
    destroy() {
        for (let i = 0; i < this.numOfThreads; i++) {
        if (this._activeWorkers[i]) {
        throw new Error(`${i}號線程仍在工作中...`);
        }
        this._workers[i].terminate();
        }
    }
    // 檢查是否有空閒worker
    checkWorkers() {
        for (let i = 0; i < this.numOfThreads; i++) {
        if (!this._activeWorkers[i]) {
        return i;
        }
        }
        return -1;
    }
    run(getData) {
        return new Promise((resolve, reject) => {
        const restWorkerId = this.checkWorkers();
        const queueItem = {
            getData,
            callback: (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            }
        }
        // 線程池已滿,將任務加入任務隊列
        if (restWorkerId === -1) {
            this._queue.push(queueItem);
            return null;
        }
        // 空閒線程執行任務
        this.runWorker(restWorkerId, queueItem);
        })
    }
    async runWorker(workerId, queueItem) {
        const worker = this._workers[workerId];
        this._activeWorkers[workerId] = true;
        // 線程結果回調
        const messageCallback = (result) => {
            queueItem.callback(null, result);
            cleanUp();
        };
        // 線程錯誤回調
        const errorCallback = (error) => {
            queueItem.callback(error);
            cleanUp();
        };
        // 任務結束消除舊監聽器,若還有待完成任務,繼續完成
        const cleanUp = () => {
            worker.removeAllListeners('message');
            worker.removeAllListeners('error');
            this._activeWorkers[workerId] = false;
            if (!this._queue.length) {
                return null;
            }
            this.runWorker(workerId, this._queue.shift());
        }
        // 線程創建監聽結果/錯誤回調
        worker.once('message', messageCallback);
        worker.once('error', errorCallback);
        // 向子線程傳遞初始data
        worker.postMessage(queueItem.getData);
    }
}

module.exports = WorkerPool ;