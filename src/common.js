const SCENE_COUNT = 11;

const WebGLMacros = {AMC_ATTRIBUTE_VERTEX : 0,
					 AMC_ATTRIBUTE_COLOR : 1,
					 AMC_ATTRIBUTE_NORMAL : 2,
					 AMC_ATTRIBUTE_TEXTURE0 : 3,
					 AMC_ATTRIBUTE_INSTANCE_VEC0 : 5,
					 AMC_ATTRIBUTE_INSTANCE_VEC1 : 6,
					 AMC_ATTRIBUTE_INSTANCE_VEC2 : 7,
					 AMC_ATTRIBUTE_INSTANCE_VEC3 : 8,
				 	};


 var positions = [
	[560.8545185895381 -140.20000000000001  ,-41.895462980012326 + -20.900000000000002 ,429.54810801654077 + 80.29999999999997] , 
	[560.8545185895381 -110.20000000000001  ,-40.895462980012326 + -20.900000000000002 ,429.54810801654077 + 80.29999999999997] , 
	[560.8545185895381 -94.20000000000001   ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 90.29999999999997] , 
	[560.8545185895381 - 80.20000000000001  ,-23.895462980012326 + -20.900000000000002 ,429.54810801654077 + 80.29999999999997] , 
	[560.8545185895381 -75                  ,-33.895462980012326 + -23                 ,429.54810801654077 +95] ,                                                
	[560.8545185895381 -24.20000000000001   ,-42.895462980012326 + -20.900000000000002 ,429.54810801654077 + 80.29999999999997] , 
	[560.8545185895381 - 10                 ,-41.895462980012326 -19                   ,429.54810801654077 + 80], 	                                                 
	[560.8545185895381 - 0.20000000000001   ,-40.895462980012326 + -20.900000000000002 ,429.54810801654077 + 180.29999999999997] , 
	[560.8545185895381 - 1.20000000000001   ,-38.895462980012326 + -20.900000000000002 ,429.54810801654077 + 80.29999999999997]  ,
	[560.8545185895381 + 21.20000000000001  ,-35.895462980012326 + -20.900000000000002 ,429.54810801654077 + 65.29999999999997],

	[560.8545185895381 -140.20000000000001  ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 110.29999999999997] , 
	[560.8545185895381 -110.20000000000001  ,-36.895462980012326 + -20.900000000000002 ,429.54810801654077 + 120.29999999999997] , 
	[560.8545185895381 -94.20000000000001   ,-38.895462980012326 + -20.900000000000002 ,429.54810801654077 + 100.29999999999997] , 
	[560.8545185895381 - 80.20000000000001  ,-39.895462980012326 + -20.900000000000002 ,429.54810801654077 + 140.29999999999997] , 
	[560.8545185895381 -75                  ,-40.895462980012326 + -23                 ,429.54810801654077 + 200.00000000000000] ,                                                
	[560.8545185895381 -24.20000000000001   ,-41.895462980012326 + -20.900000000000002 ,429.54810801654077 + 240.29999999999997] , 
	[560.8545185895381 - 10                 ,-40.895462980012326 -19                   ,429.54810801654077 + 210.00000000000000], 	                                                 
	[560.8545185895381 - 0.20000000000001   ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 90.29999999999997] , 
	[560.8545185895381 - 1.20000000000001   ,-39.895462980012326 + -20.900000000000002 ,429.54810801654077 + 170.29999999999997]  ,
	[560.8545185895381 + 21.20000000000001  ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 265.29999999999997]  ,  

	[560.8545185895381 -140.20000000000001  ,-41.895462980012326 + -20.900000000000002 ,429.54810801654077 + 50.29999999999997] , 
	[560.8545185895381 -110.20000000000001  ,-40.895462980012326 + -20.900000000000002 ,429.54810801654077 + 10.29999999999997] , 
	[560.8545185895381 -94.20000000000001   ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 60.29999999999997] , 
	[560.8545185895381 - 80.20000000000001  ,-23.895462980012326 + -20.900000000000002 ,429.54810801654077 + 40.29999999999997] , 
	[560.8545185895381 -75                  ,-33.895462980012326 + -23                 ,429.54810801654077 + 25] ,                                                
	[560.8545185895381 -24.20000000000001   ,-42.895462980012326 + -20.900000000000002 ,429.54810801654077 + 30.29999999999997] , 
	[560.8545185895381 - 10                 ,-41.895462980012326 -19                   ,429.54810801654077 + 50], 	                                                 
	[560.8545185895381 - 0.20000000000001   ,-40.895462980012326 + -20.900000000000002 ,429.54810801654077 + 60.29999999999997] , 
	[560.8545185895381 - 1.20000000000001   ,-38.895462980012326 + -20.900000000000002 ,429.54810801654077 + 10.29999999999997]  ,
	[560.8545185895381 + 21.20000000000001  ,-35.895462980012326 + -20.900000000000002 ,429.54810801654077 + 25.29999999999997],

	[560.8545185895381 -140.20000000000001  ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 210.29999999999997] , 
	[560.8545185895381 -110.20000000000001  ,-36.895462980012326 + -20.900000000000002 ,429.54810801654077 + 220.29999999999997] , 
	[560.8545185895381 -94.20000000000001   ,-38.895462980012326 + -20.900000000000002 ,429.54810801654077 + 300.29999999999997] , 
	[560.8545185895381 - 80.20000000000001  ,-39.895462980012326 + -20.900000000000002 ,429.54810801654077 + 240.29999999999997] , 
	[560.8545185895381 -75                  ,-40.895462980012326 + -23                 ,429.54810801654077 + 300.00000000000000] ,                                                
	[560.8545185895381 -24.20000000000001   ,-41.895462980012326 + -20.900000000000002 ,429.54810801654077 + 340.29999999999997] , 
	[560.8545185895381 - 10                 ,-40.895462980012326 -19                   ,429.54810801654077 + 410.00000000000000], 	                                                 
	[560.8545185895381 - 0.20000000000001   ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 590.29999999999997] , 
	[560.8545185895381 - 1.20000000000001   ,-39.895462980012326 + -20.900000000000002 ,429.54810801654077 + 370.29999999999997]  ,
	[560.8545185895381 + 21.20000000000001  ,-33.895462980012326 + -20.900000000000002 ,429.54810801654077 + 365.29999999999997]    
 ];

