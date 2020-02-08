
{
    // helper functions
    const MathUtils = {
        // map number x from range [a, b] to [c, d]
        map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
        // linear interpolation
        lerp: (a, b, n) => (1 - n) * a + n * b,
        // Random float
        getRandomFloat: (min, max) => (Math.random() * (max - min) + min).toFixed(2)
    };

    // 바디 속성 변수에 저장하기
    const body = document.body;
    
    // 화면 사이즈 변수 만들기
    let winsize;
    
    // 화면 사이즈 구하기
    //const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
    const calcWinsize = function(){
        winsize = {
            width: window.innerWidth, 
            height: window.innerHeight
        };
    }    
    
    // 화면 사이즈 실행하기
    calcWinsize();
    
    // 화면 사이즈 변경될 때마다 사이즈 구하기
    window.addEventListener('resize', calcWinsize);
    
    
    // 스크롤 위치 값 변수 만들기
    let docScroll;
    
    // 스크롤 위치 마지막 값 변수 만들기
    let lastScroll;
    
    // 스크롤 스피드 변수 만들기
    let scrollingSpeed = 0;
    
    // 스크롤 위치 알아내기
    //const getPageYScroll = () => docScroll = window.pageYOffset || document.documentElement.scrollTop;
    const getPageYScroll = function(){
        docScroll = window.pageYOffset || document.documentElement.scrollTop;
    }
    // window.pageYOffset : 브라우저의 문서 위치(스크롤된 위치)의 y좌표를 반환합니다.
    // document.documentElement.scrollTop : 브라우저 스크롤의 위치값을 반환합니다.
    
    //console.log(window.pageYOffset);
    //console.log(document.documentElement.scrollTop);
    
    // 스크롤 될 때마다 스크롤 값 구하기
    window.addEventListener('scroll', getPageYScroll);

    
    
    // Item
    class Item {
        constructor(el) {
            // the .item element
            this.DOM = {el: el};
            // the inner image
            this.DOM.image = this.DOM.el.querySelector('.content__item-img');
            this.DOM.imageWrapper = this.DOM.image.parentNode;
            this.DOM.title = this.DOM.el.querySelector('.content__item-title');
            this.renderedStyles = {
                // here we define which property will change as we scroll the page and the item is inside the viewport
                // in this case we will be:
                // - scaling the inner image
                // - translating the item's title
                // we interpolate between the previous and current value to achieve a smooth effect
                // 이전 값과 현재 값의 차이를 통해 부드러운 효과를 만듭니다.
                imageScale: {        
                    previous: 0,  // 이전 값
                    current: 0,   // 현재 값
                    ease: 0.1,    // 움직임
                    // 현재 값 setter
                    setValue: () => {  
                        const toValue = 1.5;
                        const fromValue = 1;
                        const val = MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue);
                        return Math.max(Math.min(val, toValue), fromValue);
                    }
                }, 
                //타이틀 이질감 느끼게 하기
                titleTranslationY: {
                    previous: 0,  //이전 값
                    current: 0,   //현재 값
                    ease: 0.1,    //움직임
                    fromValue: Number(MathUtils.getRandomFloat(30,400)),
                    setValue: () => {
                        const fromValue = this.renderedStyles.titleTranslationY.fromValue;
                        const toValue = -1*fromValue;
                        const val = MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue);
                        return fromValue < 0 ? Math.min(Math.max(val, fromValue), toValue) : Math.max(Math.min(val, fromValue), toValue);
                    }
                }
            };
            // gets the item's height and top (relative to the document)
            // 사이즈 값 알아내기
            this.getSize();
            
            // set the initial values
            // 최초의 값 설정
            this.update();
            
            // use the IntersectionObserver API to check when the element is inside the viewport
            // only then the element styles will be updated
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => this.isVisible = entry.intersectionRatio > 0);
            });
            this.observer.observe(this.DOM.el);
            // init/bind events
            this.initEvents();
        }
        update() {
            // sets the initial value (no interpolation)
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
            }
            // apply changes/styles
            this.layout();
        }
        
        getSize() {
            const rect = this.DOM.el.getBoundingClientRect();
            this.props = {
                //아이템의 높이값
                height: rect.height,
                // offset top relative to the document
                // 문서를 기준으로 offset top값 가져오기
                top: docScroll + rect.top
            }
        }
        //Element.getBoundingClientRect() 메서드는 요소의 크기와 요소의 viewport에서의 상대적인 위치를 반환합니다
        
        initEvents() {
            window.addEventListener('resize', () => this.resize());
        }
        resize() {
            // gets the item's height and top (relative to the document)
            this.getSize();
            // on resize reset sizes and update styles
            this.update();
        }
        render() {
            // update the current and interpolated values
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
            }
            
            // and apply changes
            this.layout();
        }
        layout() {
            // scale the image
            this.DOM.image.style.transform = `scale3d(${this.renderedStyles.imageScale.previous},${this.renderedStyles.imageScale.previous},1)`;
            // translate the title
            this.DOM.title.style.transform = `translate3d(0,${this.renderedStyles.titleTranslationY.previous}px,0)`;
        }
    }

    // SmoothScroll
    class SmoothScroll {
        constructor() {
            // the <main> element
            this.DOM = {main: document.querySelector('main')};
            // the scrollable element
            // we translate this element when scrolling (y-axis)
            this.DOM.scrollable = this.DOM.main.querySelector('div[data-scroll]');
            // the items on the page
            this.items = [];
            this.DOM.content = this.DOM.main.querySelector('.content');
            [...this.DOM.content.querySelectorAll('.content__item')].forEach(item => this.items.push(new Item(item)));
            // here we define which property will change as we scroll the page
            // in this case we will be translating on the y-axis
            // we interpolate between the previous and current value to achieve the smooth scrolling effect
            this.renderedStyles = {
                translationY: {
                    // interpolated value
                    previous: 0, 
                    // current value
                    current: 0, 
                    // amount to interpolate
                    ease: 0.1,
                    // current value setter
                    // in this case the value of the translation will be the same like the document scroll
                    setValue: () => docScroll
                }
            };
            // set the body's height
            this.setSize();
            // set the initial values
            this.update();
            // the <main> element's style needs to be modified
            this.style();
            // init/bind events
            this.initEvents();
            // start the render loop
            requestAnimationFrame(() => this.render());
        }
        update() {
            // sets the initial value (no interpolation) - translate the scroll value
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();   
            }   
            // translate the scrollable element
            this.layout();
        }
        layout() {
            this.DOM.scrollable.style.transform = `translate3d(0,${-1*this.renderedStyles.translationY.previous}px,0)`;
        }
        setSize() {
            // set the heigh of the body in order to keep the scrollbar on the page
            body.style.height = `${this.DOM.scrollable.scrollHeight}px`;
        }
        style() {
            // the <main> needs to "stick" to the screen and not scroll
            // for that we set it to position fixed and overflow hidden 
            this.DOM.main.style.position = 'fixed';
            this.DOM.main.style.width = this.DOM.main.style.height = '100%';
            this.DOM.main.style.top = this.DOM.main.style.left = 0;
            this.DOM.main.style.overflow = 'hidden';
        }
        initEvents() {
            // on resize reset the body's height
            window.addEventListener('resize', () => this.setSize());
        }
        render() {
            // Get scrolling speed
            // Update lastScroll
            scrollingSpeed = Math.abs(docScroll - lastScroll);
            lastScroll = docScroll;
            
            // update the current and interpolated values
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);    
            }
            // and translate the scrollable element
            this.layout();
            
            // for every item
            for (const item of this.items) {
                // if the item is inside the viewport call it's render function
                // this will update item's styles, based on the document scroll value and the item's position on the viewport
                if ( item.isVisible ) {
                    if ( item.insideViewport ) {
                        item.render();
                    }
                    else {
                        item.insideViewport = true;
                        item.update();
                    }
                }
                else {
                    item.insideViewport = false;
                }
            }
            
            // loop..
            requestAnimationFrame(() => this.render());
        }
    }

    /***********************************/
    /********** Preload stuff **********/

    // Preload images
    const preloadImages = () => {
        return new Promise((resolve, reject) => {
            imagesLoaded(document.querySelectorAll('.content__item-img'), {background: true}, resolve);
        });
    };
    
    // And then..
    preloadImages().then(() => {
        // Remove the loader
        document.body.classList.remove('loading');
        // Get the scroll position and update the lastScroll variable
        getPageYScroll();
        lastScroll = docScroll;
        // Initialize the Smooth Scrolling
        new SmoothScroll();
    });
}