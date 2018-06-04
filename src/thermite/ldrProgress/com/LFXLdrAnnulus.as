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
//  File:      LFXLdrAnnulusAS.as
//                                                                        
//  Purpose:   LFXLdrAnnulusAS code behind implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Jan 30 2012  
//
//*********************************************************************************


package com
{
	//** imports
	
	import flash.events.*;
	
	import mx.graphics.SolidColor;
	
	import primitives.*;
	import skins.*;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.supportClasses.*;
	import spark.core.*;
	import spark.primitives.*;
	
	import util.*;
		
	//--------------------------------------
	//  Skin states
	//--------------------------------------
	
	[SkinState("shown")]
	
	
	public class LFXLdrAnnulus extends SkinnableComponent
	{
		/**
		 * The skin part that represents the rings in the underlying skin
		 * 
		 * Defining it here will link SAnnulus here to the actual object in the skinClass.  This is part of the 'magic' 
		 * of metadata - [SkinPart (required="true")] creates and entry in the skinParts array object in skinnableComponent
		 * so that when the skin is attached to this object the parts in the skin are wired up to the skinPart variables in the 
		 * components. 
		 * 
		 */
		[SkinPart(required="true")]		
		public var SAnnulus:LFXAnnulusElement;

		[SkinPart(required="true")]		
		public var Sprogress:Label;
		
		public var SlightBox:Rect;

		public var _numSegments:int = 0;			
		public var _loadSegment:int = 0;
		
		public var _outerRad:Number;
		public var _ratio:Number = 0;
		
		public var _text:String;
		public var _fontSize:Number;
		public var _fontFamily:String;
		public var _fontColor:int;		
		
		private var _loader:EventDispatcher = null;
		
		private var _annulusSize:Number;		
		private var _visualizationSizeDirty:Boolean = false;
		private var _eventSource:EventDispatcher;		
		private var _visualizationEventDirty:Boolean = false;		
		
		
		public function LFXLdrAnnulus()
		{
			super();
			
			// Set the default skinClass style to the name of the skin class.
			
			setStyle("skinClass", LFXLdrAnnulusSkin);
		}			
		
				
		override protected function partAdded(partName:String, instance:Object):void 
		{
			super.partAdded(partName, instance);			
			
			if (instance == SAnnulus)
			{
			}
			
		}
		
		
		override protected function partRemoved(partName:String, instance:Object):void 
		{
			super.partRemoved(partName, instance);
		}
		
		
		public function set numSegments(newValue:int) : void
		{
			_numSegments = newValue;
			_loadSegment = -1;			
			
			_visualizationSizeDirty = true;
			
			invalidateProperties();
		}
		
		
		public function get numSegments() : int
		{
			return _numSegments;
		}

		
		public function set diameter(newSize:Number) : void
		{			
			_annulusSize = newSize;
			
			_visualizationSizeDirty = true;
			
			invalidateProperties();
		}
		
		override protected function commitProperties():void 
		{
			
			// Note: it is in the super.commit where the new skin state is set
			
			super.commitProperties();
			
			// Update the progress Annulus ***********************************
			
			SAnnulus.numSegments = _numSegments;
			SAnnulus.loadSegment = _loadSegment;
			SAnnulus.ratio 		 = _ratio;			
			
			// Catch changes to size and listener - these can occur before the skinpart are created
			// so we how their values in proxies until everything is ready
			
			if(_visualizationSizeDirty)
			{
				SAnnulus.width  = _annulusSize;
				SAnnulus.height = _annulusSize;
				
				SAnnulus.invalidateSize();
				SAnnulus.invalidateDisplayList();
				
				_visualizationSizeDirty = false;
			}

			
			// Update the progress text *****************************************
			
			Sprogress.text = _text;
			
			Sprogress.invalidateProperties();
		}		
		
		
		public function listenTo(modLoader:EventDispatcher) : void
		{
			if(_loader)
			{
				_loader.removeEventListener(ProgressEvent.PROGRESS,loadProgress);
				_loader.removeEventListener(Event.COMPLETE,loadComplete);
			}
			
			_loader = modLoader;
			_loadSegment++;

			// Note: we need to reconnect these for each module - since when the module loads 
			//       we disconnect them.
			
			_loader.addEventListener(ProgressEvent.PROGRESS,loadProgress);
			_loader.addEventListener(Event.COMPLETE,loadComplete);
						
			invalidateProperties();
		}
		
		
		private function loadProgress(event:ProgressEvent):void
		{	
			var ratio:Number=event.bytesLoaded/event.bytesTotal;
			
			// Update the text
			
			_ratio = ratio; 			
			_text  = Math.ceil(_ratio * 100).toString();
			
			//trace("Load Ratio: " + _ratio + "  Progress Text: " + _text);
			
			SAnnulus.numSegments = _numSegments;
			SAnnulus.loadSegment = _loadSegment;
			SAnnulus.ratio 		 = _ratio;			
			
			Sprogress.text       = _text;
			
			SAnnulus.invalidateDisplayList();
			Sprogress.invalidateDisplayList();
		}	
		
		
		private function loadComplete(event:Event):void
		{	
			_loader.removeEventListener(ProgressEvent.PROGRESS,loadProgress);
			_loader.removeEventListener(Event.COMPLETE,loadComplete);
			
			// Update the text
			
			_ratio = 1; 			
			_text  = "100";
			
			SAnnulus.invalidateDisplayList();
			Sprogress.invalidateDisplayList();
		}	
				
	}	
	
}


