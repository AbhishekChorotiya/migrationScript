let v1Callbacks={success:null,error:null,canceled:null};let consumerEmail=window.localStorage.getItem("consumerEmail")||null;const checkoutParams={acquirerBIN:null,acquirerMerchantId:null,merchantName:null};function initCheckoutButton(queryString,v2Config){console.log(v2Config);let imageUrl="https://sandbox-assets.secure.checkout.visa.com/wallet-services-web/xo/button.png?cardBrands=VISA%2CMASTERCARD%2CDISCOVER%2CAMEX&animation=true&legacy=false&svg=true";if(queryString)imageUrl+=queryString;let v1Button=document.getElementsByClassName("v-button")[0];v1Button.src=imageUrl;v1Button.addEventListener("click",(async()=>{console.log("old checkout button clicked!");Vsb=window.VSDK;try{await Vsb.initialize(v2Config);if(consumerEmail){getCardsList()}else{console.log("consumerEmail is not set");getUserEmail()}console.log("===> Coming here")}catch(error){console.error("Error initializing SDK:",error)}}))}async function getUserEmail(){const overlayDiv=createOverlay();const iframeDiv=createIframeDialog(overlayDiv);const wrapperDiv=document.createElement("div");wrapperDiv.style.backgroundColor="white";wrapperDiv.style.height="100%";wrapperDiv.id="emailInputWrapper";wrapperDiv.style.display="flex";wrapperDiv.style.flexDirection="column";const OTPInputComponent=document.createElement("email-input");wrapperDiv.appendChild(OTPInputComponent);iframeDiv.appendChild(wrapperDiv);return wrapperDiv}async function getCardsList(){let consumerIdentity={identityProvider:"SRC",identityValue:consumerEmail,identityType:"EMAIL_ADDRESS"};let cards=await Vsb.getCards({consumerIdentity:consumerIdentity});console.log("===> cards",cards);let{actionCode:actionCode}=cards;console.log("===> actionCode",actionCode);let overlayDiv=null;let iframeDiv=null;let otpInput=null;try{document.body.removeChild(document.getElementById("sdkOverlay"))}catch{console.log("Error removing overlayDiv")}switch(actionCode){case"SUCCESS":console.log("Available cards: ",cards);window.localStorage.setItem("consumerEmail",consumerEmail);overlayDiv=createOverlay();iframeDiv=createIframeDialog(overlayDiv);listCards(iframeDiv,cards);break;case"PENDING_CONSUMER_IDV":console.log("Pending consumer IDV");window.localStorage.setItem("consumerEmail",consumerEmail);overlayDiv=createOverlay();iframeDiv=createIframeDialog(overlayDiv);otpInput=createOtpInput(iframeDiv,cards);break;case"ERROR":console.log("Handle error cases:");break;default:console.log("No cards found >> ",cards.actionCode);break}}function createIframe(iframeDiv){const iframe=document.createElement("iframe");iframe.style.width="100%";iframe.style.height="100%";iframe.style.border="none";iframeDiv.appendChild(iframe);return iframe}function createIframeDialog(overlayDiv){const iframeDiv=document.createElement("div");const headerComponent=document.createElement("header-component");headerComponent.id="header-component";iframeDiv.appendChild(headerComponent);iframeDiv.style.width="100%";iframeDiv.style.maxWidth="400px";iframeDiv.style.height="500px";iframeDiv.style.border="none";iframeDiv.style.margin="0";iframeDiv.style.padding="0";iframeDiv.style.position="absolute";iframeDiv.style.top="50%";iframeDiv.style.left="50%";iframeDiv.style.transform="translate(-50%, -50%)";iframeDiv.style.zIndex="9999";iframeDiv.id="iframeDiv";overlayDiv.appendChild(iframeDiv);iframeDiv.addEventListener("click",(e=>{e.stopPropagation();e.preventDefault()}));return iframeDiv}function createOverlay(){const overlayDiv=document.createElement("div");overlayDiv.id="sdkOverlay";overlayDiv.style.position="fixed";overlayDiv.style.top="0";overlayDiv.style.left="0";overlayDiv.style.width="100vw";overlayDiv.style.height="100vh";overlayDiv.style.backgroundColor="rgba(0, 0, 0, 0.75)";overlayDiv.style.zIndex="999";document.body.appendChild(overlayDiv);overlayDiv.addEventListener("click",(()=>{document.body.removeChild(overlayDiv);v1Callbacks.canceled()}));return overlayDiv}function createOtpInput(iframeDiv,cards){const wrapperDiv=document.createElement("div");wrapperDiv.style.backgroundColor="white";wrapperDiv.style.height="100%";wrapperDiv.id="otpInputBox";wrapperDiv.style.display="flex";wrapperDiv.style.flexDirection="column";const OTPInputComponent=document.createElement("otp-input-component");OTPInputComponent.setAttribute("maskedValidationChannel",cards?.maskedValidationChannel);wrapperDiv.appendChild(OTPInputComponent);iframeDiv.appendChild(wrapperDiv);return wrapperDiv}function listCards(iframeDiv,cards){const wrapperDiv=document.createElement("div");wrapperDiv.style.backgroundColor="white";wrapperDiv.style.height="100%";wrapperDiv.id="otpInputBox";wrapperDiv.style.display="flex";wrapperDiv.style.flexDirection="column";const OTPInputComponent=document.createElement("card-selector");OTPInputComponent.setAttribute("cardsList",JSON.stringify(cards?.profiles[0]?.maskedCards));wrapperDiv.appendChild(OTPInputComponent);iframeDiv.appendChild(wrapperDiv);return wrapperDiv}async function handleCheckout(srcDigitalCardId){try{const overlayDiv=document.getElementById("sdkOverlay");const iframeDiv=document.getElementById("iframeDiv");iframeDiv.removeChild(document.getElementById("otpInputBox"));const headerComponent=document.getElementById("header-component");iframeDiv.removeChild(headerComponent);const iframeRef=createIframe(iframeDiv);const checkoutParameters={srcDigitalCardId:srcDigitalCardId||"",payloadTypeIndicatorCheckout:"FULL",windowRef:iframeRef,dpaTransactionOptions:{authenticationPreferences:{authenticationMethods:[{authenticationMethodType:"3DS",authenticationSubject:"CARDHOLDER",methodAttributes:{challengeIndicator:"01"}}],payloadRequested:"AUTHENTICATED"},acquirerBIN:checkoutParams?.acquirerBIN,acquirerMerchantId:checkoutParams?.acquirerMerchantId,merchantName:checkoutParams?.merchantName}};const checkoutResponse=await Vsb.checkout(checkoutParameters);iframeDiv.removeChild(iframeRef);overlayDiv.removeChild(iframeDiv);document.body.removeChild(overlayDiv);console.log("===> My Response",checkoutResponse);v1Callbacks.success(checkoutResponse)}catch(e){console.log("===> My Error",error);v1Callbacks.error(error)}}async function handleOtpSubmit(otp){try{let consumerIdentity={identityProvider:"SRC",identityValue:consumerEmail,identityType:"EMAIL_ADDRESS"};const validationDataInput={consumerIdentity:consumerIdentity,validationData:otp};cards=await Vsb.getCards(validationDataInput);console.log("===> Cards",cards);const iframeDiv=document.getElementById("iframeDiv");iframeDiv.removeChild(document.getElementById("otpInputBox"));listCards(iframeDiv,cards)}catch(error){console.log("===> My Error",error);v1Callbacks.error(error)}}function loadVisaV2SDK(dpaId,callback){console.log(dpaId);const sdkUrl=`https://sandbox.secure.checkout.visa.com/checkout-widget/resources/js/integration/v2/sdk.js?dpaId=${dpaId}&locale=en_US&cardBrands=visa,mastercard&dpaClientId=TestMerchant`;const script=document.createElement("script");script.src=sdkUrl;script.onload=()=>{console.log("[Bridge] Visa v2 SDK loaded successfully.");if(callback)callback()};script.onerror=()=>{console.error("[Bridge] Failed to load Visa v2 SDK.")};document.body.appendChild(script)}const v1CheckoutFuctions={init:initConfig=>{const v1Config=initConfig;const requiredParams=["apikey","acquirerBIN","acquirerMerchantId","merchantName"];let hasRequiredData=true;for(let param of requiredParams){if(!v1Config?.[param]){console.error("Missing required init parameter:",param);hasRequiredData=false}}if(!hasRequiredData)return;checkoutParams.acquirerBIN=v1Config.acquirerBIN;checkoutParams.acquirerMerchantId=v1Config.acquirerMerchantId;checkoutParams.merchantName=v1Config.merchantName;const cardBrands=initConfig?.settings?.payment?.cardBrands;let queryString="";if(cardBrands?.length){queryString="&orderedCardBrands="+cardBrands.join(",")}else{queryString+="&orderedCardBrands=ALL"}let v2Config=buildV2InitializeConfig(v1Config);console.log(v2Config);initCheckoutButton(queryString,v2Config);const dpaId=v1Config.apikey;loadVisaV2SDK(dpaId,(()=>{}))},additionalCheckoutParameters:params=>{console.log(params)},on:(eventName,callback)=>{switch(eventName){case"payment.success":v1Callbacks.success=callback;break;case"payment.cancel":v1Callbacks.canceled=callback;break;case"payment.error":v1Callbacks.error=callback;break;default:console.log("Unknown event name:",eventName);break}}};window.V=v1CheckoutFuctions;async function initV2Checkout(initConfig){Vsb=window.VSDK;try{await Vsb.initialize(initConfig);console.log("SUCCESSFULL INIT")}catch(e){console.log(e);v1Callbacks.error(e)}}onVisaCheckoutReady();function buildV2InitializeConfig(initDataV1){console.log("V1",initDataV1);const initDataV2={dpaTransactionOptions:{}};if(initDataV1.settings?.locale){initDataV2.dpaTransactionOptions.dpaLocale=initDataV1.settings.locale}if(initDataV1.paymentRequest?.subtotal&&initDataV1.paymentRequest.currencyCode){initDataV2.dpaTransactionOptions.transactionAmount={transactionAmount:`${initDataV1.paymentRequest.subtotal}`,transactionCurrencyCode:initDataV1.paymentRequest.currencyCode||"USD"}}if(initDataV1.settings?.billingCountries){initDataV2.dpaTransactionOptions.dpaAcceptedBillingCountries=initDataV1.settings.billingCountries}if(initDataV1.settings?.countryCode){initDataV2.dpaTransactionOptions.merchantCountryCode=initDataV1.settings.countryCode}if(initDataV1.paymentRequest?.orderId){initDataV2.dpaTransactionOptions.merchantOrderId=initDataV1.paymentRequest.orderId}return initDataV2}class OTPInputComponent extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"});this.shadowRoot.innerHTML=`\n      <style>\n        * {\n          box-sizing: border-box;\n          margin: 0;\n          padding: 0;\n        }\n\n        .sdk-wrapper {\n          display: flex;\n          flex-direction: column;\n          gap: 1rem;\n          padding: 1.25rem;\n        }\n\n        .sdk-otp-input-wrap {\n          display: flex;\n          flex-direction: column;\n          gap: 1rem;\n          padding: 0.25rem 0 0.25rem 0;\n          border-top: 1px solid #4a4a4a;\n          margin-top: 1rem;\n        }\n\n        .input {\n          border: none;\n          border-bottom: 1px solid #494949;\n          color: #222;\n          display: inline-block;\n          font-size: 1rem;\n          outline: 0;\n          overflow: hidden;\n          padding: 19px 10px 9px 0;\n          text-overflow: ellipsis;\n          width: 100%;\n          word-break: normal;\n          border-bottom: 2px solid #ffdc00;\n        }\n\n        .primary-button {\n          margin-bottom: 10px;\n          margin-top: 10px;\n        }\n\n        .cta {\n          background-color: #003ea9;\n          border: 1px solid #003ea9;\n          color: #fff;\n          cursor: pointer;\n          text-decoration: none;\n        }\n\n        .cta {\n          border-radius: 2px;\n          font-size: .875rem;\n          font-weight: 600;\n          line-height: 20px;\n          min-height: 40px;\n          padding: 0 20px;\n          text-transform: uppercase;\n        }\n\n        .sdk-user-info>* {\n          margin: 0;\n          padding: 0;\n        }\n\n        .sdk-user-info {\n          display: flex;\n          flex-direction: column;\n          font-weight: 600;\n          font-size: 14px;\n          gap: 5px;\n        }\n\n        .sdk-info-box {\n          display: flex;\n          flex-direction: column;\n          align-items: center;\n          gap: 1rem;\n        }\n\n        .sdk-info-box>h1 {\n          font-weight: 100;\n          font-size: 1.375rem;\n        }\n\n        .sdk-info-box>p {\n          font-size: 14px;\n        }\n\n        .secondary-btn-wrap {\n          display: flex;\n          justify-content: end;\n        }\n\n        .secondary-btn {\n          border: none;\n          text-decoration: underline;\n          background-color: transparent;\n          color: #1e237e;\n        }\n\n        .cta:hover {\n          background-color: #002f82;\n        }\n      </style>\n\n      <div class="sdk-wrapper">\n        <div class="sdk-info-box">\n          <h1>Welcome Back</h1>\n          <p>Enter the one-time code Visa sent to</p>\n          <div class="sdk-user-info">\n            <p id="maskedValidationChannel"></p>\n            <button class="secondary-btn" id="not-you-btn">not you?</button>\n          </div>\n        </div>\n        <div class="sdk-otp-input-wrap">\n          <label for="otp-input" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">One-time Code</label>\n          <input id="otp-input" class="input" type="text" placeholder="One-time Code" aria-label="One-time Code"></input>\n          <div class="secondary-btn-wrap">\n            <button class="secondary-btn" id="resend-otp-btn">Resend code</button>\n          </div>\n          <button class="ctn cta primary-button" id="confirm-btn">Confirm</button>\n        </div>\n      </div>\n    `}connectedCallback(){const value=this.getAttribute("maskedValidationChannel");console.log("Attribute cardsList:",value);const maskedValidationChannel=this.shadowRoot.getElementById("maskedValidationChannel");if(maskedValidationChannel){maskedValidationChannel.textContent=value||""}this.shadowRoot.getElementById("confirm-btn").addEventListener("click",this.handleConfirm.bind(this));this.shadowRoot.getElementById("not-you-btn").addEventListener("click",this.handleNotYou.bind(this));this.shadowRoot.getElementById("resend-otp-btn").addEventListener("click",this.handleResendOTP.bind(this))}handleConfirm(){const otpValue=this.shadowRoot.getElementById("otp-input").value;console.log(`OTP value: ${otpValue}`);handleOtpSubmit(otpValue)}handleNotYou(){console.log("not you")}handleResendOTP(){console.log("resend otp")}}customElements.define("otp-input-component",OTPInputComponent);class CardListItem extends HTMLElement{constructor(){super();const shadow=this.attachShadow({mode:"open"});const template=document.createElement("template");template.innerHTML=`\n      <style>\n        li {\n          padding: 0 1.25rem;\n        }\n\n        .btn-div {\n          display: flex;\n          align-items: center;\n          gap: 1rem;\n          font-size: .875rem;\n        }\n\n        img {\n          height: 46px;\n          width: 73px;\n          border-radius: 0.4rem;\n        }\n\n        li:hover {\n           background-color: rgba(205, 209, 228, 0.4);\n        }\n\n        .btn {\n          background-color: transparent;\n          border: none;\n          padding: 1rem 0;\n          height: 100%;\n          width: 100%;\n          border-bottom: 1px solid #d7d7de;\n          cursor: pointer;\n        }\n      </style>\n      <li>\n        <button class="btn" aria-label="Select Card">\n          <div class="btn-div">\n            <img id="cardSrc" src="" alt="card">\n            <span id="cardText" class="card-text">Error...</span>\n          </div>\n        </button>\n      </li>\n    `;const content=template.content.cloneNode(true);shadow.appendChild(content)}connectedCallback(){console.log("CardSelector component is loaded");console.log(this.getAttribute("card-text"));console.log(this.getAttribute("image-src"));const image=this.shadowRoot.getElementById("cardSrc");image.src=this.getAttribute("image-src");const textElement=this.shadowRoot.getElementById("cardText");textElement.textContent=this.getAttribute("card-text");const button=this.shadowRoot.querySelector(".btn");button.addEventListener("click",handleCardSelect.bind(this));function handleCardSelect(){const cardId=this.getAttribute("card-id");console.log("Card selected:");handleCheckout(cardId)}}}customElements.define("card-list-item",CardListItem);class CardSelector extends HTMLElement{constructor(){super();const shadow=this.attachShadow({mode:"open"});const template=document.createElement("template");template.innerHTML=`\n      <style>\n        * {\n          box-sizing: border-box;\n          margin: 0;\n          padding: 0;\n        }\n\n        .sdk-wrapper {\n          display: flex;\n          flex-direction: column;\n          gap: 1rem;\n        }\n\n        h1 {\n          color: #222;\n          font-size: 16px;\n          font-weight: 400;\n          margin: 0;\n          text-align: left;\n        }\n\n        p {\n          font-size: 12px;\n          font-weight: 400;\n          margin: 8px 0 0;\n          text-align: left;\n        }\n\n        .heading-wrap {\n          padding: 1.25rem;\n          padding-bottom: 0.25rem;\n        }\n\n        ul {\n          list-style-type: none;\n          margin: 0;\n          padding: 0;\n        }\n      </style>\n\n      <div class="sdk-wrapper">\n        <div class="heading-wrap">\n          <h1>SELECT CARD</h1>\n          <p>Select from card(s) set up for Click to Pay</p>\n        </div>\n        <ul id="ul-list" class="card-list">\n\n        </ul>\n      </div>\n    `;shadow.appendChild(template.content.cloneNode(true))}connectedCallback(){console.log("CardSelector component is loaded");const cardList=JSON.parse(this.getAttribute("cardsList"));const ulList=this.shadowRoot.getElementById("ul-list");cardList.forEach(((card,i)=>{const li=document.createElement("card-list-item");li.setAttribute("image-src",card?.digitalCardData?.artUri);const cardNetwork=getCardNetwork(card?.panBin);const cardText=`${cardNetwork}... ${card?.panLastFour}`;li.setAttribute("card-text",cardText);li.setAttribute("card-id",card?.srcDigitalCardId);ulList.appendChild(li)}))}}customElements.define("card-selector",CardSelector);class EmailInput extends HTMLElement{constructor(){super();const shadow=this.attachShadow({mode:"open"});const style=document.createElement("style");style.textContent=`\n      * {\n        box-sizing: border-box;\n        margin: 0;\n        padding: 0;\n      }\n      \n      .sdk-wrapper {\n        display: flex;\n        flex-direction: column;\n        gap: 1rem;\n        padding: 1rem;\n      }\n      \n      .sdk-otp-input-wrap {\n        display: flex;\n        flex-direction: column;\n        gap: 1rem;\n        padding: 0.25rem 0 0.25rem 0;\n        border-top: 1px solid #4a4a4a;\n        margin-top: 1rem;\n      }\n      \n      .input {\n        border: none;\n        border-bottom: 1px solid #494949;\n        color: #222;\n        display: inline-block;\n        font-size: 1rem;\n        outline: 0;\n        overflow: hidden;\n        padding: 19px 10px 9px 0;\n        text-overflow: ellipsis;\n        width: 100%;\n        word-break: normal;\n        border-bottom: 2px solid #ffdc00;\n      }\n      \n      .primary-button {\n        margin-bottom: 10px;\n        margin-top: 10px;\n      }\n      \n      .cta {\n        background-color: #003ea9;\n        border: 1px solid #003ea9;\n        color: #fff;\n        cursor: pointer;\n        text-decoration: none;\n      }\n      \n      .cta {\n        border-radius: 2px;\n        font-size: .875rem;\n        font-weight: 600;\n        line-height: 20px;\n        min-height: 40px;\n        padding: 0 20px;\n        text-transform: uppercase;\n      }\n      \n      .sdk-info-box {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 1rem;\n      }\n      \n      .sdk-info-box>h1 {\n        font-weight: 100;\n        font-size: 1.375rem;\n      }\n      \n      .sdk-info-box>p {\n        font-size: 1rem;\n      }\n      \n      .secondary-btn {\n        border: none;\n        text-decoration: underline;\n        background-color: transparent;\n        color: #1e237e;\n        cursor: pointer;\n      }\n      \n      .cta:hover {\n        background-color: #002f82;\n      }\n    `;const wrapper=document.createElement("div");wrapper.classList.add("sdk-wrapper");wrapper.innerHTML=`\n      <div class="sdk-info-box">\n        <h1 style="text-align: center;">Easy and Smart online <br /> checkout</h1>\n        <p>Pay with confidence with Click to Pay</p>\n      </div>\n      <div class="sdk-otp-input-wrap">\n        <label for="otp-input" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">\n          Email Address\n        </label>\n        <input id="otp-input" class="input" type="text" placeholder="Email Address" aria-label="Email Address" />\n        <div class="secondary-btn-wrap">\n          By continuing, you agree to Visa's\n          <button class="secondary-btn">Privacy Notice</button>\n        </div>\n        <button class="ctn cta primary-button">CONTINUE</button>\n      </div>\n    `;shadow.appendChild(style);shadow.appendChild(wrapper);const continueButton=shadow.querySelector(".primary-button");continueButton.addEventListener("click",(()=>{const emailInput=shadow.querySelector("#otp-input").value;console.log("Entered Email Address:",emailInput);consumerEmail=emailInput;getCardsList()}))}}customElements.define("email-input",EmailInput);class HeaderComponent extends HTMLElement{constructor(){super();const shadow=this.attachShadow({mode:"open"});shadow.innerHTML=`\n      <style>\n        * {\n          box-sizing: border-box;\n          margin: 0;\n          padding: 0;\n        }\n\n        .header {\n          background-color: white;\n          height: fit-content;\n          padding: 0.4rem 1.25rem;\n          padding-right: 0.75rem;\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          border-bottom: 1px solid black;\n        }\n\n        .logo-warp {\n          height: 18px;\n          width: 29px;\n        }\n\n        .close-btn {\n          width: 2rem;\n          height: 2rem;\n          display: flex;\n          align-items: center;\n          background-color: transparent;\n          justify-content: center;\n          border: none;\n          border-radius: 50%;\n          cursor: pointer;\n        }\n\n        .close-btn:hover {\n          background-color: rgba(205, 209, 228, 0.5);\n          width: 2rem;\n          height: 2rem;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          border: none;\n          border-radius: 50%;\n        }\n      </style>\n\n      <div class="header">\n        <div class="logo-warp">\n      <svg class="src-icon" role="img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\n        viewBox="0 0 29 18" aria-labelledby="paymentIconTitle paymentIconDesc">\n        <defs>\n          <title id="paymentIconTitle">Payment icon</title>\n          <desc id="paymentIconDesc">Click to pay with payment icon</desc>\n          <path id="a" d="M0 0h27.985v17.897H0z"></path>\n        </defs>\n        <g fill="none" fill-rule="evenodd">\n          <mask id="b" fill="white">\n            <use xlink:href="#a"></use>\n          </mask>\n          <path\n            d="M27.755 8.376L21.05.41a.803.803 0 0 0-.689-.394.813.813 0 0 0-.806.82c0 .238.1.453.26.603l6.075 7.488-6.007 7.345H17.288l5.677-6.716.01-.013h.001a.848.848 0 0 0 .225-.586.848.848 0 0 0-.225-.587l-.011-.012L16.186.422l-.004-.005a.802.802 0 0 0-.693-.402h-4.761a.813.813 0 0 0-.806.82c0 .137.019.28.092.38l6.31 7.771-5.378 6.56c-.032.033-.495.704-1.31.704H3.215a1.593 1.593 0 0 1-1.598-1.613V3.265c0-.801.724-1.624 1.617-1.624H7.23c.471 0 .806-.327.806-.806C8.035.355 7.7 0 7.23 0L3.195.016C1.284.016 0 1.62 0 3.25v11.388c0 1.754 1.521 3.249 3.195 3.249h6.42a3.176 3.176 0 0 0 1-.16 3.48 3.48 0 0 0 1.522-1.019l6.051-7.171c.287-.33.325-.81.005-1.167h-.001c-.004-.003-.007-.008-.01-.012l-5.724-6.716H15.1l5.982 7.315-6.295 7.722c-.002.002.002.008.01.019a.827.827 0 0 0-.092.38c0 .453.361.82.806.82h4.76a.803.803 0 0 0 .698-.407l6.78-7.935.01-.013c.32-.357.282-.835-.004-1.166"\n            fill="black" mask="url(#b)"></path>\n        </g>\n      </svg>\n        </div>\n        <button class="close-btn">\n      <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg"\n        xmlns:xlink="http://www.w3.org/1999/xlink">\n        <g id="Cancel" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n          <path\n            d="M1.70710678,0.29289322 L7,5.585 L12.2928932,0.29289322 C12.6834175,-0.097631073 13.3165825,-0.097631073 13.7071068,0.29289322 C14.0976311,0.68341751 14.0976311,1.31658249 13.7071068,1.70710678 L8.415,7 L13.7071068,12.2928932 C14.0976311,12.6834175 14.0976311,13.3165825 13.7071068,13.7071068 C13.3165825,14.0976311 12.6834175,14.0976311 12.2928932,13.7071068 L7,8.415 L1.70710678,13.7071068 C1.31658249,14.0976311 0.68341751,14.0976311 0.29289322,13.7071068 C-0.097631073,13.3165825 -0.097631073,12.6834175 0.29289322,12.2928932 L5.585,7 L0.29289322,1.70710678 C-0.097631073,1.31658249 -0.097631073,0.68341751 0.29289322,0.29289322 C0.68341751,-0.097631073 1.31658249,-0.097631073 1.70710678,0.29289322 Z"\n            class="close-icon-svgpath" fill="#003ea9" fill-rule="nonzero"></path>\n        </g>\n      </svg>\n        </button>\n      </div>\n    `;const closeButton=shadow.querySelector(".close-btn");closeButton.addEventListener("click",(()=>{console.log("closed");const overlay=document.getElementById("sdkOverlay");v1Callbacks.canceled();document.body.removeChild(overlay)}))}}customElements.define("header-component",HeaderComponent);function getCardNetwork(panBin){const bin=panBin.toString();const cardNetworks=[{name:"Visa",pattern:/^4\d{5}$/},{name:"MasterCard",pattern:/^(5[1-5]\d{4}|2(22[1-9]\d{3}|2[3-9]\d{4}|[3-6]\d{5}|7[0-1]\d{4}|720\d{3}))$/},{name:"American Express",pattern:/^3[47]\d{4}$/},{name:"Discover",pattern:/^(6011\d{2}|65\d{4}|64[4-9]\d{3}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[0-1]\d|92[0-5])\d{2})$/},{name:"JCB",pattern:/^35(2[89]|[3-8]\d)\d{2}$/},{name:"Diners Club",pattern:/^3(0[0-5]\d{3}|[68]\d{4})$/},{name:"Maestro",pattern:/^(5018|5020|5038|56|57|58|6304|6759|676[1-3])\d{2}$/},{name:"UnionPay",pattern:/^62\d{4}$/},{name:"RuPay",pattern:/^(60|65|81|82|508)\d{3}$/}];for(const network of cardNetworks){if(network.pattern.test(bin)){return network.name}}return"Unknown"}