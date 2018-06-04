//*********************************************************************************
//
// The MIT License (MIT)
//
// Copyright(c) 2012 Kevin Willows. All Rights Reserved.   
//                                                                        
// Permission is hereby granted, free of charge, to any person obtaining a copy of 
// this software and associated documentation files (the "Software"), to deal in the 
// Software without restriction, including without limitation the rights to use, 
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
// Software, and to permit persons to whom the Software is furnished to do so, subject 
// to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all 
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//  
//  File:      LFXLdrProgress.as
//                                                                        
//  Purpose:   LFXLdrProgress code behind implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Feb 04 2012  
//
//*********************************************************************************


package com
{
	//** imports
	
	import flash.events.*;
	
	import mx.graphics.SolidColor;
		
	import skins.*;
	
	import spark.components.*;
	import spark.components.supportClasses.*;
	import spark.core.*;
	import spark.primitives.*;
	
	import util.*;
	
	//--------------------------------------
	//  Skin states
	//--------------------------------------
	
	[SkinState("disabled")]
	[SkinState("normal")]
	
	
	public class LFXLdrProgress extends SkinnableContainer
	{
		// Define the skin parts for the Button 		
		
		[SkinPart(required="false")]		
		public var Sbackground:Rect;

		[SkinPart(required="true")]		
		public var Svisualization:LFXLdrAnnulus;
		
		
		public var ldrState:String = "disabled";

		private var _annulusSize:Number;		
		private var _visualizationSizeDirty:Boolean = false;
		private var _eventSource:EventDispatcher;		
		private var _visualizationEventDirty:Boolean = false;		
		
		public function LFXLdrProgress()
		{
			super();
										
			// Set the default skinClass style to the name of the skin class.
			
			setStyle("skinClass", LFXLdrProgressSkin);
			
			left	=0;
			right	=0; 
			top		=0; 
			bottom	=0;	
		}			
		
		override protected function commitProperties():void
		{
			super.commitProperties();
			
			if(_visualizationSizeDirty && Svisualization)
			{
				Svisualization.diameter  = _annulusSize;
				
				_visualizationSizeDirty = false;
			}
			
			if(_visualizationEventDirty && Svisualization)
			{
				Svisualization.listenTo(_eventSource);
				
				_visualizationEventDirty = false;				
			}					
			
		}
		
				
		public function set currentSkinState(newState:String) : void
		{
			ldrState = newState;
			
			this.invalidateSkinState();
		}
		
		override protected function getCurrentSkinState():String 
		{
			return ldrState; 
		}			
		
		override protected function createChildren():void
		{
			super.createChildren();
		}
		
		
		override protected function partAdded(partName:String, instance:Object):void 
		{
			super.partAdded(partName, instance);			
			
			if (instance == Svisualization)
			{
				if(_visualizationSizeDirty)
				{
					Svisualization.diameter  = _annulusSize;
					
					_visualizationSizeDirty = false;
				}
				
				if(_visualizationEventDirty)
				{
					Svisualization.listenTo(_eventSource);
					
					_visualizationEventDirty = false;				
				}					
			}
		}
		
		
		override protected function partRemoved(partName:String, instance:Object):void 
		{
			super.partRemoved(partName, instance);
		}

		
		public function set diameter(newSize:Number) : void
		{			
			_annulusSize = newSize;
			
			_visualizationSizeDirty = true;
			
			invalidateProperties();
		}
		
		public function listenTo(modLoader:EventDispatcher) : void
		{				
			_eventSource = modLoader;
			
			_visualizationEventDirty = true;
			
			invalidateProperties();
		}		
			
	}	
	
}


