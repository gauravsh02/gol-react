import { useState, useRef, useMemo, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import Modal from './Modal';
import useIntervalHook from '../hooks/useIntervalHook';
// import {useParamsContext} from '../context/gol-context';

var isCanvasInitialized = false;

export default function Gol() {

  const cellSize = 20;
  const intervalTimeMiliSec = 500;

  const golAreaReff = useRef<HTMLInputElement>(null);
  const golCanvasReff = useRef<HTMLCanvasElement>(null);

  // const {params, setParams} = useParamsContext();
  // params.isCanvasInitialized
  // setParams({...params, isCanvasInitialized: true});

  const worker: Worker = useMemo(() => new Worker(new URL('../workers/golCanvasRender.worker.ts', import.meta.url)), []);
  if(golCanvasReff && golCanvasReff.current) {
    if(!isCanvasInitialized) {
      isCanvasInitialized = true;
      const offscreenCanvas = golCanvasReff.current.transferControlToOffscreen();
      worker.postMessage({action: 'initilize_canvas', canvas: offscreenCanvas}, [offscreenCanvas]);
      worker.addEventListener('message', (event) => {
        setGolGridData(event.data);
      });
      golCanvasReff.current.addEventListener('click', (e:any) => {
        toggleIsPlay(false);
        worker.postMessage({action: 'canvas_click', data : { pageX : e.pageX, offsetLeft : e.currentTarget.offsetLeft, pageY : e.pageY, offsetTop : e.currentTarget.offsetTop }});
      });
    }
  }

  const [showModal, setShowModal] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [golGridData, setGolGridData] = useState({'generation': 0, 'active_cell': 0});

  useEffect(() => {
    window.addEventListener('resize', setCanvasHeightAndWidth, false);
    setCanvasHeightAndWidth();
  }, []);

  const setCanvasHeightAndWidth = () => {
    toggleIsPlay(false);
    setCanvasHeight(golAreaReff && golAreaReff.current ? golAreaReff.current.offsetHeight : 0);
    setCanvasWidth(golAreaReff && golAreaReff.current ? golAreaReff.current.offsetWidth : 0);
  }

  useEffect(() => {
      worker.postMessage({
        action: 'initilize',
        data: {
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          cellSize: cellSize
        }
      });
  }), [canvasHeight, canvasWidth];

  const toggleIsPlay = (opt:any) => {
    const val = typeof opt == 'boolean' ? opt : !isPlay;
    setIsPlay(val);
  }

  const runSimmulation = () => {
    if(isPlay) {
      worker.postMessage({
        action: 'next_gol_grid',
        data: {}
      });
    }
  }

  const regenerateRandomGolGrid = () => {
    toggleIsPlay(false);
    worker.postMessage({
      action: 'gen_random',
      data: {}
    });
  }

  const clearGolGrid = () => {
    toggleIsPlay(false);
    worker.postMessage({
      action: 'clear_grid',
      data: {}
    });
  }

  useIntervalHook(()=> {
      runSimmulation()
  }, intervalTimeMiliSec);

  return (
    <>
      <div className='flex flex-col h-screen w-full'>
        <div className='h-fit'>
          <h1 className='font-bold text-4xl pt-1'>
            Game of Life
          </h1>
          <div className='flex items-center justify-center p-2 text-base'>
            <div className='flex p-2 border-solid border-2 border-gray-500 text-gray-300'>
              <span className='font-light text-left min-w-[110px]'>Generation : {golGridData.generation}</span> <div className='info-separator border-solid border-1 border-gray-500 mx-2'></div> <span className='font-light text-left min-w-[110px]'>Active Cell : {golGridData.active_cell}</span>
            </div>
          </div>
          <div className='p-2'>
            {
            isPlay ? 
              <>
                <button id='pause' onClick={toggleIsPlay} className='inline-flex items-center justify-center w-8 h-8 mr-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-full focus:shadow-outline hover:bg-indigo-800'>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='w-5 h-5'>
                    <path d='M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z' />
                  </svg>
                </button>
                <Tooltip  anchorSelect='#pause' content='Pause'  place='bottom'/>
              </>
            :
              <>
                <button id='play' onClick={toggleIsPlay} className='inline-flex items-center justify-center w-8 h-8 mr-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-full focus:shadow-outline hover:bg-indigo-800'>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='w-5 h-5'>
                    <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
                  </svg>
                </button>
                <Tooltip  anchorSelect='#play' content='Play'  place='bottom'/>
              </>
            }
            <button id='clear' onClick={clearGolGrid} className='inline-flex items-center justify-center w-8 h-8 mr-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-full focus:shadow-outline hover:bg-indigo-800'>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='w-5 h-5'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z' clipRule='evenodd' />
                </svg>
            </button>
            <Tooltip  anchorSelect='#clear' content='Clear'  place='bottom'/>

            <button id='random' onClick={regenerateRandomGolGrid} className='inline-flex items-center justify-center w-8 h-8 mr-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-full focus:shadow-outline hover:bg-indigo-800'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='w-5 h-5'>
                <path fillRule='evenodd' d='M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z' clipRule='evenodd' />
              </svg>
            </button>
            <Tooltip  anchorSelect='#random' content='Random'  place='bottom'/>

            <button id='infoButton' onClick={() => setShowModal(true)}
             className='inline-flex items-center justify-center w-8 h-8 mr-2 text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-full focus:shadow-outline hover:bg-indigo-800'>
              <svg className='w-5 h-5' fill='currentColor' id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><g id='SVGRepo_bgCarrier' strokeWidth='0'></g><g id='SVGRepo_tracerCarrier' strokeLinecap='round' strokeLinejoin='round'></g><g id='SVGRepo_iconCarrier'> <path d='M7.41527,7.75061v3.68905H6.3764v1.576h4.24028v-1.576H9.599v-5.265H6.3764v1.576Zm.27562-2.69847A1.19081,1.19081,0,0,0,9.72622,4.2135a1.16411,1.16411,0,0,0-.34629-.8457,1.19293,1.19293,0,0,0-1.69258,0,1.15814,1.15814,0,0,0-.34982.8457A1.14424,1.14424,0,0,0,7.69089,5.05214Z'></path> </g></svg>
            </button>
            <Tooltip  anchorSelect='#infoButton' content='Info'  place='bottom'/>

            <Modal open={showModal} handleConfirm={setShowModal} />

          </div>
        </div>
        <div className='gol-area' ref={golAreaReff}>
          <canvas id='gol-canvas' ref={golCanvasReff} />
        </div>
      </div>
    </>
  )
}