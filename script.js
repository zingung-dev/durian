document.addEventListener('DOMContentLoaded', function() {
    // 모바일 메뉴 관련 코드 제거 (햄버거 메뉴 사용하지 않음)
    
    // 모바일 환경에서 모달 및 전체 페이지 핀치줌 활성화
    function enablePinchZoom() {
        // 모바일에서 핀치줌 제한하는 이벤트를 방지
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1) {
                // 기본 핀치줌 동작 허용 (기본 동작 방지 안함)
            }
        }, { passive: true });

        // 모달 내에서도 핀치줌 허용
        const projectModal = document.getElementById('projectModal');
        if (projectModal) {
            projectModal.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                    // 기본 핀치줌 동작 허용 (기본 동작 방지 안함)
                }
            }, { passive: true });
        }
    }

    // 페이지 로드 시 핀치줌 활성화
    enablePinchZoom();
    
    // 특허/상표 탭 기능
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 탭 버튼에서 active 클래스 제거
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 모든 탭 컨텐츠 숨김
            const tabPanes = document.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 선택한 탭의 컨텐츠 표시
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 모달 표시 관련 코드 재작성 - 테이블 구조 기반 최적화
    const projectModal = document.getElementById('projectModal');
    const modalTable = document.getElementById('modalTable');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalLink = document.getElementById('modalLink');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // 이미지 확대/축소 기능 추가
    let imgScale = 1;
    let imgTranslateX = 0;
    let imgTranslateY = 0;
    let startX = 0;
    let startY = 0;
    let lastTouchDistance = 0;
    
    // 이미지 드래그 및 핀치 줌 처리
    function setupModalImageZoom() {
        if (!modalImage) return;
        
        // 더블 탭으로 이미지 확대/축소
        modalImage.addEventListener('dblclick', function(e) {
            e.preventDefault();
            if (imgScale === 1) {
                imgScale = 2;
                updateImageTransform();
            } else {
                resetImageZoom();
            }
        });
        
        // 터치 시작
        modalImage.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // 두 손가락 터치 - 핀치 줌 시작
                lastTouchDistance = getTouchDistance(e.touches);
            } else if (e.touches.length === 1) {
                // 한 손가락 터치 - 드래그 시작
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        // 터치 이동
        modalImage.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                // 핀치 줌
                const distance = getTouchDistance(e.touches);
                const scale = distance / lastTouchDistance;
                
                // 이전 스케일에 새 스케일 곱하기 (상대적 변화)
                imgScale = Math.min(Math.max(imgScale * scale, 1), 4);
                lastTouchDistance = distance;
                
                updateImageTransform();
            } else if (e.touches.length === 1 && imgScale > 1) {
                // 확대된 상태에서 드래그
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                // 이미지 드래그 구현
                imgTranslateX += (touchX - startX);
                imgTranslateY += (touchY - startY);
                
                startX = touchX;
                startY = touchY;
                
                updateImageTransform();
            }
        }, { passive: true });
        
        // 터치 종료
        modalImage.addEventListener('touchend', function(e) {
            if (imgScale <= 1) {
                resetImageZoom();
            }
        }, { passive: true });
    }
    
    // 두 터치 포인트 간의 거리 계산
    function getTouchDistance(touches) {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    }
    
    // 이미지 변환 적용
    function updateImageTransform() {
        modalImage.style.transform = `scale(${imgScale}) translate(${imgTranslateX / imgScale}px, ${imgTranslateY / imgScale}px)`;
        modalImage.style.transition = 'transform 0.15s ease';
    }
    
    // 이미지 확대/축소 초기화
    function resetImageZoom() {
        imgScale = 1;
        imgTranslateX = 0;
        imgTranslateY = 0;
        updateImageTransform();
    }
    
    // 이미지 캐시 - 모든 프로젝트 이미지를 미리 로드
    const imageCache = {};
    
    // 이미지 프리로드 함수
    function preloadImage(src) {
        if (!imageCache[src]) {
            const img = new Image();
            img.src = src;
            imageCache[src] = img;
        }
    }
    
    // 페이지 로드 시 모든 프로젝트 이미지 프리로드
    function preloadAllProjectImages() {
        document.querySelectorAll('.project-item img').forEach(img => {
            if (img.src) {
                preloadImage(img.src);
            }
        });
    }
    
    // 페이지 로드 후 이미지 프리로드 시작
    window.addEventListener('load', preloadAllProjectImages);
    
    // 화면 크기에 따른 모달 최적화
    function optimizeModalForScreenSize() {
        const viewportWidth = window.innerWidth;
        
        // 화면 크기에 따른 이미지 최대 크기 조정
        if (viewportWidth < 768) {
            // 모바일 레이아웃
            modalTable.style.width = '95%';
            modalTable.style.maxWidth = '100%';
            modalImage.style.maxHeight = '45vh';
        } else if (viewportWidth < 1200) {
            // 태블릿 레이아웃
            modalTable.style.width = '85%';
            modalTable.style.maxWidth = '900px';
            modalImage.style.maxHeight = '50vh';
        } else {
            // 데스크톱 레이아웃
            modalTable.style.width = '85%';
            modalTable.style.maxWidth = '1200px';
            modalImage.style.maxHeight = '60vh';
        }
    }
    
    // 모달 초기화 (DOM에 추가될 때 한 번만 실행)
    function initModal() {
        // 이미지 확대/축소 기능 초기화
        setupModalImageZoom();
        
        // 원래 스타일 저장을 위한 변수
        let originalBodyStyle;
        
        // 모달 닫기 이벤트
        closeModalBtn.addEventListener('click', () => {
            projectModal.style.display = 'none';
            document.body.style.overflow = originalBodyStyle || '';
            resetImageZoom(); // 이미지 확대/축소 상태 초기화
            
            // active 클래스 제거
            document.querySelectorAll('.project-item').forEach(el => {
                el.classList.remove('active');
            });
        });
        
        // 모달 외부 클릭 시 닫기
        projectModal.addEventListener('click', e => {
            if (e.target === projectModal) {
                projectModal.style.display = 'none';
                document.body.style.overflow = originalBodyStyle || '';
                resetImageZoom(); // 이미지 확대/축소 상태 초기화
                
                // active 클래스 제거
                document.querySelectorAll('.project-item').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && projectModal.style.display === 'block') {
                projectModal.style.display = 'none';
                document.body.style.overflow = originalBodyStyle || '';
                resetImageZoom(); // 이미지 확대/축소 상태 초기화
                
                // active 클래스 제거
                document.querySelectorAll('.project-item').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });
        
        // 창 크기 변경 시 모달 레이아웃 조정
        window.addEventListener('resize', () => {
            if (projectModal.style.display === 'block') {
                optimizeModalForScreenSize();
                resetImageZoom(); // 이미지 확대/축소 상태 초기화
            }
        });
        
        // 프로젝트 아이템 클릭 이벤트에서 사용할 수 있도록 originalBodyStyle 변수 노출
        return {
            setOriginalBodyStyle: (style) => {
                originalBodyStyle = style;
            }
        };
    }
    
    // 페이지 로드 시 모달 초기화
    const modalControls = initModal();
    
    // 프로젝트 링크가 개발중이거나 공사중인지 확인하는 함수 (클래스로 판단)
    function isSpecialProjectButton(element) {
        return element.classList.contains('in-progress') || element.classList.contains('under-reconstruction');
    }
    
    // 커스텀 알림창 함수
    function showCustomAlert() {
        const customAlert = document.getElementById('customAlert');
        const closeBtn = document.getElementById('alertClose');
        
        // 알림창 표시
        customAlert.style.display = 'block';
        
        // 스크롤 방지 (스크롤바 유지하면서)
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        
        // 확인 버튼 이벤트
        closeBtn.onclick = function() {
            customAlert.style.display = 'none';
            document.body.style.overflow = originalStyle;
        };
        
        // 배경 클릭 시 닫기
        customAlert.onclick = function(e) {
            if (e.target === customAlert) {
                customAlert.style.display = 'none';
                document.body.style.overflow = originalStyle;
            }
        };
        
        // ESC 키로 닫기
        const escKeyHandler = function(e) {
            if (e.key === 'Escape' && customAlert.style.display === 'block') {
                customAlert.style.display = 'none';
                document.body.style.overflow = originalStyle;
                document.removeEventListener('keydown', escKeyHandler);
            }
        };
        
        document.addEventListener('keydown', escKeyHandler);
    }
    
    // 프로젝트 아이템 클릭 이벤트 - 모달 내용 채우기 & 표시
    document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', function() {
            // 모든 프로젝트 아이템에서 active 클래스 제거
            document.querySelectorAll('.project-item').forEach(el => {
                el.classList.remove('active');
            });
            
            // 클릭한 아이템에 active 클래스 추가
            this.classList.add('active');
            
            // 이미지 확대/축소 상태 초기화
            resetImageZoom();
            
            // 이미지 미리 로드 (깜빡임 방지)
            const imgSrc = this.querySelector('img').src;
            if (imageCache[imgSrc]) {
                // 캐시된 이미지 있으면 설정
                modalImage.src = imgSrc;
            } else {
                // 없으면 로드 시작
                modalImage.src = imgSrc;
                preloadImage(imgSrc);
            }
            
            // 프로젝트 정보 가져오기
            const titleElement = this.querySelector('h3');
            const title = titleElement.childNodes[0].textContent.trim();
            const badge = titleElement.querySelector('.project-badge');
            const subtitle = this.querySelector('p:nth-of-type(1)').textContent;
            const description = this.querySelector('p:nth-of-type(2)').textContent;
            const originalLinkElement = this.querySelector('a'); // 원본 <a> 요소 가져오기
            
            // 원래 스타일 저장
            const originalBodyStyle = window.getComputedStyle(document.body).overflow;
            
            // 모달 컨트롤에 원래 스타일 전달
            if (modalControls && typeof modalControls.setOriginalBodyStyle === 'function') {
                modalControls.setOriginalBodyStyle(originalBodyStyle);
            }
            
            // 화면 스크롤 방지 (스크롤바 유지하면서)
            document.body.style.overflow = 'hidden';
            
            // 내용 채우기
            modalTitle.textContent = title;
            
            // 배지가 있으면 추가
            if (badge) {
                const modalBadge = document.createElement('span');
                modalBadge.className = 'project-badge';
                modalBadge.textContent = badge.textContent;
                modalBadge.style.marginLeft = '10px';
                modalBadge.style.fontSize = '12px';
                modalTitle.appendChild(modalBadge);
            }
            
            modalSubtitle.textContent = subtitle;
            modalDescription.textContent = description;
            
            // 모달 표시 준비
            optimizeModalForScreenSize();
            
            // 모달 표시 (작은 창 이슈 방지를 위해 setTimeout 사용)
            setTimeout(() => {
                projectModal.style.display = 'block';
            }, 10);

            // 모달 버튼 설정
            const modalLinkBtn = document.getElementById('modalLink');
            
            // 버튼 초기화 (이전 이벤트 리스너 제거를 위해 복제)
            const newModalBtn = modalLinkBtn.cloneNode(true);
            modalLinkBtn.parentNode.replaceChild(newModalBtn, modalLinkBtn);
            
            // 원본 버튼의 모든 클래스를 새 모달 버튼에 복사 (스타일을 CSS에 위임)
            newModalBtn.className = ''; // 기존 클래스 모두 제거
            originalLinkElement.classList.forEach(cls => {
                newModalBtn.classList.add(cls);
            });
            
            // 'btn' 클래스가 없으면 추가 (확실히 버튼 스타일 적용)
            if (!newModalBtn.classList.contains('btn')) {
                newModalBtn.classList.add('btn');
            }

            // 인라인 스타일 제거 (CSS가 스타일을 제어하도록)
            newModalBtn.style.backgroundColor = '';
            newModalBtn.style.borderColor = '';
            newModalBtn.style.cursor = ''; // 커서 스타일도 CSS에 위임
            
            // 버튼 텍스트 설정
            const link = originalLinkElement.getAttribute('href'); // 변경: .href 대신 .getAttribute('href') 사용
            newModalBtn.textContent = originalLinkElement.textContent; // 원본 버튼의 텍스트를 그대로 사용
            newModalBtn.href = link; // 여기서는 이미 변경된 'link' 변수를 사용

            // 개발중 또는 공사중 버튼 이벤트 처리 (클래스 존재 여부로 판단)
            if (isSpecialProjectButton(originalLinkElement)) {
                newModalBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showCustomAlert();
                    return false;
                });
            } else {
                // 정상 프로젝트는 외부 링크로 이동
                newModalBtn.addEventListener('click', function() {
                    window.open(link, '_blank'); // 여기에서도 변경된 'link' 변수를 사용
                });
            }
        });
    });
    
    // 조직도 생성
    const orgChartContainer = document.getElementById('org-chart');
    if (orgChartContainer) {
        // 기존 조직도 요소 숨기기
        document.querySelector('.org-chart').style.display = 'none';
        
        // 새로운 조직도 컨테이너 생성
        const newOrgContainer = document.createElement('div');
        newOrgContainer.id = 'org-chart-container';
        orgChartContainer.parentNode.insertBefore(newOrgContainer, orgChartContainer.nextSibling);
        
        // 조직도 프레임 생성
        const orgFrame = document.createElement('div');
        orgFrame.id = 'org-chart-frame';
        orgFrame.style.width = '100%';
        orgFrame.style.height = '550px';
        orgFrame.style.backgroundColor = '#f8f9fa';
        orgFrame.style.borderRadius = '8px';
        orgFrame.style.overflow = 'hidden';
        orgFrame.style.position = 'relative';
        orgFrame.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        orgFrame.style.marginBottom = '20px';
        orgFrame.style.border = '1px solid #eee';
        newOrgContainer.appendChild(orgFrame);
        
        // 날짜 표시 - 프레임 위에 놓기
        const dateContainer = document.createElement('div');
        dateContainer.className = 'org-date';
        dateContainer.innerHTML = '2025년 6월기준';
        dateContainer.style.position = 'absolute';
        dateContainer.style.top = '10px';
        dateContainer.style.right = '10px';
        dateContainer.style.fontSize = '14px';
        dateContainer.style.fontWeight = 'bold';
        dateContainer.style.color = '#333';
        dateContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        dateContainer.style.padding = '4px 8px';
        dateContainer.style.borderRadius = '4px';
        dateContainer.style.zIndex = '10';
        orgFrame.appendChild(dateContainer);
        
        // 컨텐츠 래퍼 생성
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'org-chart-content-wrapper';
        contentWrapper.style.width = '100%';
        contentWrapper.style.height = '100%';
        contentWrapper.style.overflow = 'hidden';
        contentWrapper.style.position = 'relative';
        orgFrame.appendChild(contentWrapper);
        
        // 조직도 컨텐츠 생성
        const contentContainer = document.createElement('div');
        contentContainer.id = 'org-chart-content';
        contentContainer.style.width = '100%';
        contentContainer.style.height = '100%';
        contentContainer.style.position = 'absolute';
        contentContainer.style.transformOrigin = 'top center';
        contentContainer.style.top = '0';
        contentContainer.style.left = '0';
        contentWrapper.appendChild(contentContainer);
        
        // SVG 컨테이너
        const svgContainer = document.createElement('div');
        svgContainer.id = 'org-chart-svg-container';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.position = 'relative';
        svgContainer.style.display = 'flex';
        svgContainer.style.alignItems = 'center';
        svgContainer.style.justifyContent = 'center';
        svgContainer.style.padding = '0';
        contentContainer.appendChild(svgContainer);
        
        // 조직도 내부 컨테이너 (중앙 정렬용)
        const chartInnerContainer = document.createElement('div');
        chartInnerContainer.style.position = 'relative';
        chartInnerContainer.style.width = '100%';
        chartInnerContainer.style.height = '85%'; // 노트를 위한 공간 확보
        chartInnerContainer.style.display = 'flex';
        chartInnerContainer.style.alignItems = 'center';
        chartInnerContainer.style.justifyContent = 'center';
        svgContainer.appendChild(chartInnerContainer);
        
        // 조직도 설명 추가 (박스 내부로 이동)
        const orgNote = document.createElement('div');
        orgNote.className = 'org-note';
        orgNote.innerHTML = '<p><span class="highlight" style="background-color: yellow; padding: 0 2px;">※ 노란색 인간직원</span>, 그 외 AI직원</p>';
        orgNote.style.position = 'absolute';
        orgNote.style.bottom = '10px';
        orgNote.style.right = '20px';
        orgNote.style.textAlign = 'right';
        orgNote.style.padding = '5px 8px';
        orgNote.style.margin = '0';
        orgNote.style.zIndex = '10';
        orgNote.style.whiteSpace = 'nowrap'; // 줄바꿈 방지
        orgNote.style.fontSize = '14px'; // 폰트 크기 조정
        orgNote.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; // 기본 배경색 설정
        orgNote.style.borderRadius = '4px'; // 기본 둥근 모서리 추가
        orgNote.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; // 기본 그림자 추가
        orgFrame.appendChild(orgNote); // 프레임에 직접 추가
        
        // 조직도 데이터 - PC 버전을 위한 원래 위치 (y값 조정)
        const nodes = [
            { id: 'ceo', text: '대표', type: 'ceo', x: 50, y: 25 },
            { id: 'advisor1', text: '자문단', subtext: '최민성 변호사 / 박형배 대표', type: 'advisor', x: 37.5, y: 40 },
            { id: 'advisor2', text: '책사', subtext: '제갈공명 / 아테나', type: 'advisor', x: 62.5, y: 40 },
            { id: 'team1', text: '비전기획팀', type: 'team', x: 16.67, y: 60 },
            { id: 'team2', text: '혁신개발팀', type: 'team', x: 38.89, y: 60 },
            { id: 'team3', text: '디자인팀', type: 'team', x: 61.11, y: 60 },
            { id: 'team4', text: '마케팅팀', type: 'team', x: 83.33, y: 60 },
            { id: 'member1_1', text: '장영실 팀장', type: 'member', x: 16.67, y: 65 },
            { id: 'member1_2', text: '이병철 사원', type: 'member', x: 16.67, y: 69 },
            { id: 'member2_1', text: '사토시나카모토 팀장', type: 'member', x: 38.89, y: 65 },
            { id: 'member2_2', text: '테슬라 사원', type: 'member', x: 38.89, y: 69 },
            { id: 'member2_3', text: '이상범 사원', type: 'human', x: 38.89, y: 73 },
            { id: 'member3_1', text: '폴랜드 팀장', type: 'member', x: 61.11, y: 65 },
            { id: 'member3_2', text: '레오나르도다빈치 사원', type: 'member', x: 61.11, y: 69 },
            { id: 'member4_1', text: '비너스 팀장', type: 'member', x: 83.33, y: 65 },
            { id: 'member4_2', text: '양귀비 사원', type: 'member', x: 83.33, y: 69 },
            { id: 'member4_3', text: '안두리 사원', type: 'member', x: 83.33, y: 73 }
        ];
        
        // 노드 간 연결 정보
        const connections = [
            { from: 'ceo', to: 'horizontal-line', type: 'vertical' },
            { from: 'horizontal-line', to: 'advisor1', type: 'vertical' },
            { from: 'horizontal-line', to: 'advisor2', type: 'vertical' },
            { from: 'ceo', to: 'advisor-line', type: 'vertical' },
            { from: 'horizontal-line', to: 'team1', type: 'vertical' },
            { from: 'horizontal-line', to: 'team2', type: 'vertical' },
            { from: 'horizontal-line', to: 'team3', type: 'vertical' },
            { from: 'horizontal-line', to: 'team4', type: 'vertical' },
            { from: 'team1', to: 'member1_1', type: 'vertical' },
            { from: 'member1_1', to: 'member1_2', type: 'vertical' },
            { from: 'team2', to: 'member2_1', type: 'vertical' },
            { from: 'member2_1', to: 'member2_2', type: 'vertical' },
            { from: 'member2_2', to: 'member2_3', type: 'vertical' },
            { from: 'team3', to: 'member3_1', type: 'vertical' },
            { from: 'member3_1', to: 'member3_2', type: 'vertical' },
            { from: 'team4', to: 'member4_1', type: 'vertical' },
            { from: 'member4_1', to: 'member4_2', type: 'vertical' },
            { from: 'member4_2', to: 'member4_3', type: 'vertical' }
        ];
        
        // SVG 생성
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svgContainer.appendChild(svg);
        
        // 수평선 추가 (팀 노드 위의 가로선)
        const horizontalLine = document.createElementNS(svgNS, "line");
        horizontalLine.setAttribute("id", "horizontal-line");
        horizontalLine.setAttribute("x1", "16.67%");
        horizontalLine.setAttribute("y1", "52%");
        horizontalLine.setAttribute("x2", "83.33%");
        horizontalLine.setAttribute("y2", "52%");
        horizontalLine.setAttribute("stroke", "#000");
        horizontalLine.setAttribute("stroke-width", "2");
        svg.appendChild(horizontalLine);
        
        // 자문단 연결 가로선 추가
        const advisorLine = document.createElementNS(svgNS, "line");
        advisorLine.setAttribute("id", "advisor-line");
        advisorLine.setAttribute("x1", "37.5%");
        advisorLine.setAttribute("y1", "40%");
        advisorLine.setAttribute("x2", "62.5%");
        advisorLine.setAttribute("y2", "40%");
        advisorLine.setAttribute("stroke", "#000");
        advisorLine.setAttribute("stroke-width", "2");
        svg.appendChild(advisorLine);
        
        // 노드 생성 함수
        function createNode(node) {
            const nodeDiv = document.createElement('div');
            nodeDiv.id = node.id;
            nodeDiv.className = `org-node org-node-${node.type}`;
            nodeDiv.style.position = 'absolute';
            nodeDiv.style.left = `${node.x}%`;
            nodeDiv.style.top = `${node.y}%`;
            nodeDiv.style.transform = 'translate(-50%, -50%)';
            
            if (node.type === 'ceo') {
                nodeDiv.style.width = '150px';
                nodeDiv.style.height = '60px';
                nodeDiv.style.backgroundColor = '#FFC107';
                nodeDiv.style.color = '#000';
                nodeDiv.style.display = 'flex';
                nodeDiv.style.alignItems = 'center';
                nodeDiv.style.justifyContent = 'center';
                nodeDiv.style.fontWeight = 'bold';
                nodeDiv.style.fontSize = '18px';
                nodeDiv.style.zIndex = '5';
                nodeDiv.style.borderRadius = '4px';
            } else if (node.type === 'advisor') {
                nodeDiv.style.width = '210px';
                nodeDiv.style.height = '60px';
                nodeDiv.style.backgroundColor = '#1F2937';
                nodeDiv.style.color = 'white';
                nodeDiv.style.padding = '10px';
                nodeDiv.style.display = 'flex';
                nodeDiv.style.flexDirection = 'column';
                nodeDiv.style.alignItems = 'center';
                nodeDiv.style.justifyContent = 'center';
                nodeDiv.style.zIndex = '5';
                nodeDiv.style.borderRadius = '4px';
                
                const title = document.createElement('div');
                title.style.fontWeight = 'bold';
                title.style.fontSize = '16px';
                title.textContent = node.text;
                
                const subtitle = document.createElement('div');
                subtitle.style.fontSize = '14px';
                subtitle.textContent = node.subtext;
                
                nodeDiv.appendChild(title);
                nodeDiv.appendChild(subtitle);
                
                // 텍스트 내용 설정 후 return으로 건너뛰기
                svgContainer.appendChild(nodeDiv);
                return;
            } else if (node.type === 'team') {
                nodeDiv.style.width = '180px';
                nodeDiv.style.height = '40px';
                nodeDiv.style.backgroundColor = '#3A5A40';
                nodeDiv.style.color = 'white';
                nodeDiv.style.display = 'flex';
                nodeDiv.style.alignItems = 'center';
                nodeDiv.style.justifyContent = 'center';
                nodeDiv.style.fontWeight = 'bold';
                nodeDiv.style.fontSize = '16px';
                nodeDiv.style.zIndex = '5';
                nodeDiv.style.borderBottom = 'none'; // 하단 테두리 제거
                nodeDiv.style.borderRadius = '4px';
            } else if (node.type === 'member' || node.type === 'human') {
                nodeDiv.style.width = '180px';
                nodeDiv.style.height = '30px';
                nodeDiv.style.backgroundColor = '#f5f5f5';
                nodeDiv.style.border = '1px solid #ddd';
                nodeDiv.style.borderTop = 'none'; // 상단 테두리 제거
                nodeDiv.style.display = 'flex';
                nodeDiv.style.alignItems = 'center';
                nodeDiv.style.justifyContent = 'center';
                nodeDiv.style.fontSize = '14px';
                nodeDiv.style.zIndex = '5';
                nodeDiv.style.borderRadius = '0 0 4px 4px';
                
                if (node.type === 'human') {
                    const textSpan = document.createElement('span');
                    textSpan.style.backgroundColor = 'yellow';
                    textSpan.textContent = node.text;
                    nodeDiv.appendChild(textSpan);
                    
                    // 텍스트 내용 설정 후 return으로 건너뛰기
                    svgContainer.appendChild(nodeDiv);
                    return;
                }
            }
            
            nodeDiv.textContent = node.text;
            svgContainer.appendChild(nodeDiv);
        }
        
        // 연결선 생성 함수
        function createConnection(connection) {
            if (connection.from === 'horizontal-line' || connection.to === 'horizontal-line' || 
                connection.from === 'advisor-line' || connection.to === 'advisor-line') {
                // 이미 생성된 수평선과 연결하는 경우
                const nodeId = connection.from === 'horizontal-line' || connection.from === 'advisor-line' ? 
                    connection.to : connection.from;
                const lineId = connection.from === 'horizontal-line' || connection.to === 'horizontal-line' ?
                    'horizontal-line' : 'advisor-line';
                const lineY = lineId === 'horizontal-line' ? 52 : 40;
                const node = document.getElementById(nodeId);
                
                if (!node) return;
                
                // 외부자문단과 책사 아래로의 세로선 제거
                if ((nodeId === 'advisor1' || nodeId === 'advisor2') && lineId === 'horizontal-line') {
                    return;
                }
                
                const nodeRect = node.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();
                
                const x1 = (nodeRect.left + nodeRect.width / 2 - svgRect.left) / svgRect.width * 100;
                const y1 = connection.from === lineId ? lineY : (nodeRect.top - svgRect.top) / svgRect.height * 100;
                const x2 = x1;
                const y2 = connection.from === lineId ? (nodeRect.top - svgRect.top) / svgRect.height * 100 : lineY;
                
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", x1 + "%");
                line.setAttribute("y1", y1 + "%");
                line.setAttribute("x2", x2 + "%");
                line.setAttribute("y2", y2 + "%");
                line.setAttribute("stroke", "#000");
                line.setAttribute("stroke-width", "2");
                svg.appendChild(line);
                
            } else {
                // 일반 노드 간 연결
                const fromNode = document.getElementById(connection.from);
                const toNode = document.getElementById(connection.to);
                
                if (!fromNode || !toNode) return;
                
                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();
                
                // 위치 계산
                const x1 = (fromRect.left + fromRect.width / 2 - svgRect.left) / svgRect.width * 100;
                const y1 = (fromRect.bottom - svgRect.top) / svgRect.height * 100;
                const x2 = (toRect.left + toRect.width / 2 - svgRect.left) / svgRect.width * 100;
                const y2 = (toRect.top - svgRect.top) / svgRect.height * 100;
                
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", x1 + "%");
                line.setAttribute("y1", y1 + "%");
                line.setAttribute("x2", x2 + "%");
                line.setAttribute("y2", y2 + "%");
                line.setAttribute("stroke", "#000");
                line.setAttribute("stroke-width", "1");
                svg.appendChild(line);
            }
        }
        
        // 모바일 버전 조정 함수
        function adjustForMobile() {
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            if (isMobile) {
                // 모바일 스타일 적용 (이전 방식으로 복원)
                contentContainer.style.transform = 'scale(1)';
                orgNote.style.textAlign = 'center';
                orgNote.style.right = '50%';
                orgNote.style.transform = 'translateX(50%)';
                orgNote.style.width = 'auto';
                orgNote.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                contentContainer.style.width = '100%';
                svgContainer.style.width = '100%';
                chartInnerContainer.style.width = '100%';
                contentWrapper.style.width = '100%';
                contentWrapper.style.overflowX = 'auto';
                contentWrapper.style.overflowY = 'hidden';
                // 작은 모바일 화면에서 추가 조정
                if (isSmallMobile) {
                    orgNote.style.fontSize = '13px';
                    orgNote.style.padding = '4px 6px';
                }
                // 모바일에서 노드 위치 조정 (퍼센트 기준)
                const mobilePositions = {
                    'team1': { x: '10%' },
                    'team2': { x: '38%' },
                    'team3': { x: '62%' },
                    'team4': { x: '90%' },
                    'member1_1': { x: '10%', y: '72%' },
                    'member1_2': { x: '10%', y: '78%' },
                    'member2_1': { x: '38%', y: '72%' },
                    'member2_2': { x: '38%', y: '78%' },
                    'member2_3': { x: '38%', y: '84%' },
                    'member3_1': { x: '62%', y: '72%' },
                    'member3_2': { x: '62%', y: '78%' },
                    'member4_1': { x: '90%', y: '72%' },
                    'member4_2': { x: '90%', y: '78%' },
                    'member4_3': { x: '90%', y: '84%' }
                };
                Object.keys(mobilePositions).forEach(nodeId => {
                    const node = document.getElementById(nodeId);
                    if (node) {
                        if (mobilePositions[nodeId].x) {
                            node.style.left = mobilePositions[nodeId].x;
                        }
                        if (mobilePositions[nodeId].y) {
                            node.style.top = mobilePositions[nodeId].y;
                        }
                    }
                });
                // 수평선 위치 조정 (퍼센트)
                horizontalLine.setAttribute("x1", "10%");
                horizontalLine.setAttribute("x2", "90%");
                // 프레임 높이 조정 (더 크게)
                orgFrame.style.height = isSmallMobile ? '700px' : '800px';
            } else {
                // PC 스타일 복원
                contentContainer.style.transform = 'scale(1)';
                orgNote.style.textAlign = 'right';
                orgNote.style.right = '20px';
                orgNote.style.transform = 'none';
                contentContainer.style.width = '100%';
                svgContainer.style.width = '100%';
                chartInnerContainer.style.width = '100%';
                contentWrapper.style.width = '100%';
                contentWrapper.style.overflowX = 'hidden';
                contentWrapper.style.overflowY = 'hidden';
                // PC 버전에서 원래 위치로 복원
                nodes.forEach(node => {
                    const nodeElement = document.getElementById(node.id);
                    if (nodeElement) {
                        nodeElement.style.left = `${node.x}%`;
                        nodeElement.style.top = `${node.y}%`;
                    }
                });
                // 수평선 복원
                horizontalLine.setAttribute("x1", "16.67%");
                horizontalLine.setAttribute("x2", "83.33%");
                // 프레임 높이 복원
                orgFrame.style.height = '550px';
            }
            
            // 연결선 다시 그리기
            const lines = svg.querySelectorAll('line');
            lines.forEach(line => {
                if (line.id !== 'horizontal-line' && line.id !== 'advisor-line') {
                    line.remove();
                }
            });
            connections.forEach(conn => createConnection(conn));
        }
        
        // 핀치 줌 기능 설정
        function setupPinchZoom() {
            let currentScale = 1;
            let initialDistance = 0;
            let initialScale = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            let isDragging = false;
            
            function handleTouchStart(e) {
                if (e.touches.length === 2) {
                    // 두 손가락 터치 - 핀치 줌 시작
                    initialDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    initialScale = currentScale;
                    e.preventDefault();
                } else if (e.touches.length === 1) {
                    // 한 손가락 터치 - 드래그 시작
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    isDragging = true;
                }
            }
            
            function handleTouchMove(e) {
                if (e.touches.length === 2) {
                    // 두 손가락 터치 - 핀치 줌
                    e.preventDefault();
                    
                    const distance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    
                    // 확대/축소 계산
                    currentScale = Math.min(Math.max(initialScale * (distance / initialDistance), 0.5), 2.0);
                    
                    // 변환 적용 (기본 모바일 스케일 0.7에 핀치 줌 스케일을 곱함)
                    const baseScale = window.innerWidth <= 768 ? 0.7 : 1;
                    contentContainer.style.transform = `scale(${baseScale * currentScale})`;
                    
                    // 확대 중일 때 드래그 가능하도록 설정
                    if (currentScale > 1) {
                        contentWrapper.style.overflow = 'auto';
                    } else {
                        contentWrapper.style.overflow = 'hidden';
                    }
                } else if (e.touches.length === 1 && isDragging && currentScale > 1) {
                    // 한 손가락 드래그 (확대 상태에서만)
                    const touchX = e.touches[0].clientX;
                    const touchY = e.touches[0].clientY;
                    
                    // 드래그 거리 계산
                    const deltaX = touchX - touchStartX;
                    const deltaY = touchY - touchStartY;
                    
                    // 컨테이너 스크롤 적용
                    contentWrapper.scrollLeft -= deltaX;
                    contentWrapper.scrollTop -= deltaY;
                    
                    // 시작점 업데이트
                    touchStartX = touchX;
                    touchStartY = touchY;
                }
            }
            
            function handleTouchEnd() {
                isDragging = false;
            }
            
            // 더블 탭으로 확대/축소 기능
            contentWrapper.addEventListener('dblclick', function(e) {
                e.preventDefault();
                
                if (currentScale === 1) {
                    // 확대
                    currentScale = 1.5;
                    const baseScale = window.innerWidth <= 768 ? 0.7 : 1;
                    contentContainer.style.transform = `scale(${baseScale * currentScale})`;
                    contentWrapper.style.overflow = 'auto';
                } else {
                    // 축소
                    currentScale = 1;
                    const baseScale = window.innerWidth <= 768 ? 0.7 : 1;
                    contentContainer.style.transform = `scale(${baseScale})`;
                    contentWrapper.style.overflow = 'hidden';
                }
            });
            
            // 터치 이벤트 리스너 등록 (모바일)
            contentWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
            contentWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            contentWrapper.addEventListener('touchend', handleTouchEnd);
        }
        
        // 초기 노드 생성
        nodes.forEach(node => createNode(node));
        
        // 초기 연결선 생성
        connections.forEach(conn => createConnection(conn));
        
        // 핀치 줌 설정
        setupPinchZoom();
        
        // 모바일 조정
        adjustForMobile();
        
        // 리사이즈 이벤트 리스너
        window.addEventListener('resize', adjustForMobile);
    }
    
    // 스크롤 시 헤더 효과
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // 네비게이션 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 화면 크기에 따라 오프셋 조정
                let offset = 100;
                if (window.innerWidth <= 768) {
                    offset = 120; // 태블릿
                }
                if (window.innerWidth <= 480) {
                    offset = 140; // 모바일
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 문의하기 폼 제출 이벤트
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 여기서 실제 폼 제출 로직을 구현하거나 알림 표시
            alert('문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.');
            this.reset();
        });
    }
    
    // 개발중 프로젝트 바로가기 버튼 클릭 이벤트
    const projectLinks = document.querySelectorAll('.project-info a.btn');
    
    projectLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (isSpecialProjectButton(link)) {
            // 개발중 또는 공사중 버튼 스타일 유지하면서 링크 제거
            link.setAttribute('href', 'javascript:void(0)'); // 링크 동작 완전히 제거
            link.removeAttribute('target'); // 새 창으로 열기 제거
            link.style.cursor = 'pointer'; // 커서는 포인터로 유지
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showCustomAlert();
                return false; // 이벤트 전파 중지
            });
        }
    });
}); 