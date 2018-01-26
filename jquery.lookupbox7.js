/**
 * jQuery script for creating lookup box
 * @version 0.1.0
 * @requires jQuery Datatables
 *
 * Copyright (c) 2018 Tu Masdan <utu.eka@gmail.com>
 * Licensed under the GPL license:
 * 		http://www.gnu.org/licenses/gpl.html
 */

(function($) {
	function lookupbox7(options) {
		var _this = this;
		
		var settings = {
				title: "Lookup",
				remote: "",
				isModalLarge: false,
				isModalSmall: false,
				btnApplyText: 'Select Selected',
				btnCloseText: 'Close',
				noSelectedMessage: 'Please click on row to select the item.',
				minSearch: 2,
				keywords: '',
				placeholder: 'Type to search',
				
				columns: [
						{data: "id",
							orderable: true,
							searchable: true,
							className: "actions",
							width: "70px"},
						{data: "label",
							orderable: true,
							searchable: true}
					],
				headings: ['ID','Name'],
				order: [[1, 'asc']],
				onSelected: function(v){}
			};
		$.extend(settings, options);
		
		var _tpl_modal = "<div class=\"modal modal-lookup\" role=\"dialog\">\
					<div class=\"modal-dialog\">\
						<div class=\"modal-content\">\
							<div class=\"modal-header\">\
								<button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>\
								<h4 class=\"modal-title\"></h4>\
							</div>\
							<div class=\"modal-body\"></div>\
							<div class=\"modal-footer\">\
								<div class=\"row\">\
									<div class=\"col-md-6\">\
										<button type=\"button\" class=\"btn btn-block btn-sm btn-info btn-apply\" disabled=\"disabled\"></button>\
									</div>\
									<div class=\"col-md-6\">\
										<button type=\"button\" class=\"btn btn-block btn-sm btn-default btn-close\" data-dismiss=\"modal\"></button>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>\
				</div>";
		
		var _tpl_table = "<table class=\"table table-condensed table-hover\" width=\"100%\">\
					<thead>\
						<tr></tr>\
					</thead>\
					<tbody></tbody>\
					<tfoot>\
						<tr></tr>\
					</tfoot>\
				</table>";
		
		var generateDatatable = function (container){
				var _modal = this;
				
				var _table = $(_tpl_table);
				$.each(settings.headings, function(i, v){
						_table.find('> thead > tr').append('<th>' + v + '</th>');
						_table.find('> tfoot > tr').append('<th>' + v + '</th>');
					});				
				_table.appendTo(container);
				
				var selected_data;
				
				_table.DataTable({
						lengthMenu: [10,20,50,100],
						processing: true,
						serverSide: true,								
						paginate: true,
						ordering: true,
						order: settings.order,
						searching: true,
						'search': {'search': settings.keywords},
						info: false,
						responsive: true,
						autoWidth: true,
						//scrollCollapse: true,
						//scrollY: "200px",
						ajax: {
								url: settings.remote,
								type: "POST",
								data: function( params ){}
							},
						columns: settings.columns,
						dom: "<'datatable-tools'<'col-md-7'l><'col-md-5 custom-toolbar'f>r>t<'datatable-tools clearfix'<'col-md-3'i><'col-md-9'p>>",
						drawCallback: function(setting){
								var height = container.height(),
									maxHeight = $(window).height() - 200;
								
								if (height > maxHeight) {
									height = maxHeight;
									container.slimscroll({
										alwaysVisible: true,
										height: height + "px",
										color: "#98a6ad",
										borderRadius: "0"
									});
								}
								
								container.find(".dataTables_wrapper select").select2({
										minimumResultsForSearch: -1
									});
								
								_modal.find('.btn-apply').off('click');
								_modal.find('.btn-apply').on('click', function(e){
										e.preventDefault();
										
										if (selected_data){
											if ($.isFunction(settings.onSelected)){
												settings.onSelected.call(_this, selected_data);
												_modal.modal('hide');
											}
										} else {
											alert(settings.noSelectedMessage);
										}
									});	
							},
						rowCallback: function(row, data, index){
								var _row = $(row);
								_row.on('click', function(e){
										e.preventDefault();
										
										_modal.find('.btn-apply').attr('disabled', 'disabled');
										selected_data = false;
										
										_row.parent().find('.info').removeClass('info');
										_row.addClass('info');
										
										selected_data = data;
										_modal.find('.btn-apply').removeAttr('disabled');
									});
								_row.on('dblclick', function(e){
										e.preventDefault();
										if ($.isFunction(settings.onSelected)){
											settings.onSelected.call(_this, data);
											_modal.modal('hide');
										}
									});
								_row.on('hover', function(e){
										e.preventDefault();
										_row.css('cursor', 'pointer');
									});
							}
					});
			};
		
		$(document).ready(function() {
			
			// Preparing modal
			var _modal = $(_tpl_modal);
			
			if (settings.isModalLarge == true){ 
				_modal.addClass('modal-lg'); 
			} else if (settings.isModalSmall == true){ 
				_modal.addClass('modal-sm'); 
			}
			_modal.addClass('fade');			
			_modal.find('.modal-title').html(settings.title);
			
			
			$( "body" ).append(_modal);
			_modal.modal({
					backdrop: false,
					keyboard: true,
					show: false
				});
			//_modal.draggable({handle: ".modal-header"});
			
			
			_modal.on('shown.bs.modal', function(e){
					var container = _modal.find('.modal-body');
					generateDatatable.call(_modal, container);
				});
			_modal.on('hidden.bs.modal', function(e){
					$(this).find('.modal-body').html('');
					
					_modal.find('.btn-apply').off('click');
					_modal.find('.btn-apply').attr('disabled', 'disabled');
				});
			_modal.find('.btn-apply').html(settings.btnApplyText);
			_modal.find('.btn-close').html(settings.btnCloseText);
			
			_this.next('button').on('click', function(e){
					e.preventDefault();
					_modal.modal('show');
				});
			_this.on('keyup', function(e) {
					e.preventDefault();
					
					if (String($.trim($(this).val())).length >= Math.max(1, Number(settings.minSearch))){
						settings.keywords = String($.trim($(this).val()));
						_this.next('button').trigger('click');
					}
				});
			_this.attr('placeholder', settings.placeholder);
				
			return _this;
		});
	}

	$.fn.lookupbox7 = function(options) {
		var settings = options;
		return this.each(function() {
			lookupbox7.call($(this), settings);
		});
	}
})(jQuery);

