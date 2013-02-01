/*
    This file is part of the Basic Meeting List Toolbox (BMLT).
    
    Find out more at: http://bmlt.magshare.org

    BMLT is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    BMLT is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this code.  If not, see <http://www.gnu.org/licenses/>.
*/
/********************************************************************************************
*######################################### MAIN CODE #######################################*
********************************************************************************************/

function BMLT_Server_Admin ()
{
    /************************************************************************************//**
    *                                     DATA MEMBERS                                      *
    ****************************************************************************************/
    var m_account_panel_shown = null;           ///< This will be true if the "My Account" panel is exposed.
    var m_search_specifier_shown = null;        ///< This is true, if the meeting search specifier form is shown.
    var m_meeting_editor_panel_shown = null;    ///< This will be true if the "Edit Meetings" panel is exposed.
    var m_ajax_request_in_progress = null;      ///< This is any AJAX request currently under way.
    var m_success_fade_duration = null;         ///< Number of milliseconds for a success fader.
    var m_failure_fade_duration = null;         ///< Number of milliseconds for a failure fader.
    var m_search_results = null;                ///< This will contain any meeting search results.
    var m_meeting_objects = null;               ///< This will hold a list of meetings that we are working on.
    
    /************************************************************************************//**
    *                                       METHODS                                         *
    ****************************************************************************************/
    /************************************************************************************//**
    *                                   USED THROUGHOUT                                     *
    ****************************************************************************************/
    /************************************************************************************//**
    *   \brief When a text input (either <input> or <textarea> is initialized, we can set   *
    *          up a default text value that is displayed when the item is empty and not in  *
    *          focus. If we don't send in a specific value, then the current value of the   *
    *          text item is considered to be the default.                                   *
    ****************************************************************************************/
    this.handleTextInputLoad = function(    in_text_item,
                                            in_default_value,
                                            in_small
                                        )
    {
        if ( in_text_item )
            {
            in_text_item.original_value = in_text_item.value;
            
            if ( in_default_value )
                {
                in_text_item.defaultValue = in_default_value;
                }
            else
                {
                in_text_item.defaultValue = in_text_item.value;
                };
            
            in_text_item.value = in_text_item.original_value;

            if ( !in_text_item.value || (in_text_item.value == in_text_item.defaultValue) )
                {
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '') + ' bmlt_text_item_dimmed';
                }
            else
                {
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '');
                };
            };
    };
    
    /************************************************************************************//**
    *   \brief When a text item receives focus, we clear any default text.                  *
    ****************************************************************************************/
    this.handleTextInputFocus = function(   in_text_item
                                        )
    {
        if ( in_text_item )
            {
            if ( in_text_item.value == in_text_item.defaultValue )
                {
                in_text_item.value = '';
                };
            
            this.validateAccountGoButton();
            };
    };
    
    /************************************************************************************//**
    *   \brief When a text item loses focus, we restore any default text, if the item was   *
    *          left empty.                                                                  *
    ****************************************************************************************/
    this.handleTextInputBlur = function(    in_text_item,
                                            in_small
                                        )
    {
        if ( in_text_item )
            {
            if ( !in_text_item.value || (in_text_item.value == in_text_item.defaultValue) )
                {
                in_text_item.value = in_text_item.defaultValue;
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '') + ' bmlt_text_item_dimmed';
                }
            else
                {
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '');
                };
            
            this.validateAccountGoButton();
            };
    };
    
    /************************************************************************************//**
    *   \brief When a text item has its text changed, we check to see if it needs to have   *
    *          its classname changed to the default (usually won't make a difference, as    *
    *          the text item will be in focus, anyway).                                     *
    ****************************************************************************************/
    this.handleTextInputChange = function(  in_text_item,
                                            in_small
                                        )
    {
        if ( in_text_item )
            {
            if ( !in_text_item.value || (in_text_item.value == in_text_item.defaultValue) )
                {
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '') + ' bmlt_text_item_dimmed';
                }
            else
                {
                in_text_item.className = 'bmlt_text_item' + (in_small ? '_small' : '');
                };
            
            this.validateAccountGoButton();
            };
    };
    
    /************************************************************************************//**
    *                                 MY ACCOUNT SECTION                                    *
    ****************************************************************************************/
    /************************************************************************************//**
    *   \brief  Toggles the visibility of the account info section.                         *
    ****************************************************************************************/
    this.toggleAccountInfo = function()
    {
        this.m_account_panel_shown = !this.m_account_panel_shown;
        
        var the_disclosure_div = document.getElementById ( 'bmlt_admin_user_account_disclosure_div' );
        var the_account_info_div = document.getElementById ( 'bmlt_admin_user_account_wrapper_div' );
        
        if ( this.m_account_panel_shown)
            {
            the_disclosure_div.className = 'bmlt_admin_user_account_disclosure_div bmlt_admin_user_account_disclosure_div_open';
            the_account_info_div.className = 'bmlt_admin_user_account_wrapper_div';
            }
        else
            {
            the_disclosure_div.className = 'bmlt_admin_user_account_disclosure_div bmlt_admin_user_account_disclosure_div_closed';
            the_account_info_div.className = 'bmlt_admin_user_account_wrapper_div bmlt_admin_user_account_wrapper_div_hidden';
            };
    };
    
    /************************************************************************************//**
    *   \brief This checks the values of the text items in the My Account section. If any   *
    *          of them are different from their default, we enable the GO button.           *
    ****************************************************************************************/
    this.validateAccountGoButton = function()
    {
        var email_field = document.getElementById ( 'bmlt_admin_user_email_input' );
        var password_field = document.getElementById ( 'bmlt_admin_user_account_password_input' );
        var ajax_button = document.getElementById ( 'bmlt_admin_account_change_ajax_button' );
        var description = document.getElementById ( 'bmlt_admin_user_description_textarea' );
        
        if (    (email_field.value != email_field.original_value)
            ||  (description.value != description.original_value)
            ||  (password_field.value && (password_field.value != password_field.defaultValue)) )
            {
            ajax_button.className = 'bmlt_admin_ajax_button';
            }
        else
            {
            ajax_button.className = 'bmlt_admin_ajax_button button_disabled';
            };
    };
    
    /************************************************************************************//**
    *   \brief This is called to initiate an AJAX process to change the account settings.   *
    ****************************************************************************************/
    this.handleAccountChange = function()
    {
        var email_field = document.getElementById ( 'bmlt_admin_user_email_input' );
        var password_field = document.getElementById ( 'bmlt_admin_user_account_password_input' );
        var description = document.getElementById ( 'bmlt_admin_user_description_textarea' );
        var affected_user_id = document.getElementById ( 'account_affected_user_id' );
        
        // We only do something if there is a difference.
        if (    (affected_user_id.value == g_current_user_id)   // Belt and suspenders...
            &&  ((email_field.value != email_field.original_value)
            ||  (description.value != description.original_value)
            ||  (password_field.value && (password_field.value != password_field.defaultValue))) )
            {
            this.setMyAccountThrobber ( true );
            var uri = g_ajax_callback_uri + '&target_user=' + encodeURIComponent ( g_current_user_id );
            if ( email_field.value != email_field.original_value )
                {
                uri += '&account_email_value=' + encodeURIComponent ( email_field.value );
                };
            
            if ( description.value != description.original_value )
                {
                uri += '&account_description_value=' + encodeURIComponent ( description.value );
                };
            
            if ( password_field.value && (password_field.value != password_field.defaultValue) )
                {
                uri += '&account_password_value=' + encodeURIComponent ( password_field.value );
                };
            
            if ( this.m_ajax_request_in_progress )
                {
                this.m_ajax_request_in_progress.abort();
                this.m_ajax_request_in_progress = null;
                };
            this.m_ajax_request_in_progress = BMLT_AjaxRequest ( uri, function(in_req,in_data) { admin_handler_object.handleAccountChangeAJAXCallback(in_req,in_data); }, 'post', this );
            };
    };
    
    /************************************************************************************//**
    *   \brief This is called to initiate an AJAX process to change the account settings.   *
    ****************************************************************************************/
    this.handleAccountChangeAJAXCallback = function(    in_http_request,
                                                        in_context
                                                    )
    {
        var email_field = document.getElementById ( 'bmlt_admin_user_email_input' );
        var password_field = document.getElementById ( 'bmlt_admin_user_account_password_input' );
        var description = document.getElementById ( 'bmlt_admin_user_description_textarea' );
        
        this.m_ajax_request_in_progress = null;
        if ( in_http_request.responseText )
            {
            eval ( 'var json_object = ' + in_http_request.responseText + ';' );
            }
            
        if ( json_object.ACCOUNT_CHANGED )
            {
            var success = true;
            
            if ( json_object.ACCOUNT_CHANGED.EMAIL_CHANGED == true )
                {
                email_field.original_value = email_field.value;
                }
            else if ( json_object.ACCOUNT_CHANGED.EMAIL_CHANGED == false )
                {
                success = false;
                };
                
            if ( json_object.ACCOUNT_CHANGED.DESCRIPTION_CHANGED == true )
                {
                description.original_value = description.value;
                }
            else if ( json_object.ACCOUNT_CHANGED.DESCRIPTION_CHANGED == false )
                {
                success = false;
                };
            
            password_field.value = '';
            this.validateAccountGoButton();
            
            if ( success )
                {
                BMLT_Admin_StartFader ( 'bmlt_admin_fader_account_success_div', this.m_success_fade_duration );
                }
            else
                {
                BMLT_Admin_StartFader ( 'bmlt_admin_fader_account_fail_div', this.m_failure_fade_duration );
                };
            }
        else
            {
            BMLT_Admin_StartFader ( 'bmlt_admin_fader_account_fail_div', this.m_failure_fade_duration );
            };
        
        this.handleTextInputBlur ( email_field );
        this.handleTextInputBlur ( password_field );
        this.handleTextInputBlur ( description );
        
        this.setMyAccountThrobber ( false );
    };
    
    /************************************************************************************//**
    *   \brief Displays or hides the AJAX Throbber for the My Account button.               *
    ****************************************************************************************/
    this.setMyAccountThrobber = function(   in_shown    ///< If true, the throbber is show. If false, it is hidden.
                                        )
    {
        var button_span = document.getElementById ( 'bmlt_admin_account_change_ajax_button_span' );
        var throbber_span = document.getElementById ( 'bmlt_admin_account_change_ajax_button_throbber_span' );
        
        throbber_span.className = 'bmlt_admin_value_left' + (in_shown ? '' : ' item_hidden');
        button_span.className = 'bmlt_admin_value_left' + (in_shown ? ' item_hidden' : '');
    };
    
    /************************************************************************************//**
    *                               MEETING EDITOR SECTION                                  *
    ****************************************************************************************/
    /************************************************************************************//**
    *   \brief  Toggles the visibility of the meeting editor section.                       *
    ****************************************************************************************/
    this.toggleMeetingEditor = function()
    {
        this.m_meeting_editor_panel_shown = !this.m_meeting_editor_panel_shown;
        
        var the_disclosure_div = document.getElementById ( 'bmlt_admin_meeting_editor_disclosure_div' );
        var the_editor_div = document.getElementById ( 'bmlt_admin_meeting_editor_wrapper_div' );
        
        if ( this.m_meeting_editor_panel_shown )
            {
            the_disclosure_div.className = 'bmlt_admin_meeting_editor_disclosure_div bmlt_admin_meeting_editor_disclosure_div_open';
            the_editor_div.className = 'bmlt_admin_meeting_editor_wrapper_div';
            }
        else
            {
            the_disclosure_div.className = 'bmlt_admin_meeting_editor_disclosure_div bmlt_admin_meeting_editor_disclosure_div_closed';
            the_editor_div.className = 'bmlt_admin_meeting_editor_wrapper_div bmlt_admin_meeting_editor_wrapper_div_hidden';
            };
    };
    
    /************************************************************************************//**
    *   \brief  Brings up a new meeting screen.                                             *
    ****************************************************************************************/
    this.createANewMeetingButtonHit = function()
    {
        var display_parent = document.getElementById ( 'bmlt_admin_meeting_editor_new_meeting_editor_display' );
        var new_meeting_button = document.getElementById ( 'bmlt_admin_meeting_editor_form_new_meeting_button' );
        var cancel_new_meeting_button = document.getElementById ( 'bmlt_admin_meeting_editor_form_cancel_new_meeting_button' );
        
        display_parent.innerHTML = null;
        
        this.createNewMeetingEditorScreen ( display_parent, 0 );
        
        new_meeting_button.className = 'bmlt_admin_ajax_button button_disabled';
        new_meeting_button.href = null;
        cancel_new_meeting_button.className = 'bmlt_admin_ajax_button button';
        cancel_new_meeting_button.href = 'javascript:admin_handler_object.cancelANewMeetingButtonHit()';
        display_parent.className = 'bmlt_admin_meeting_editor_new_meeting_editor_display';
    };
    
    /************************************************************************************//**
    *   \brief  Brings up a new meeting screen.                                             *
    ****************************************************************************************/
    this.cancelANewMeetingButtonHit = function()
    {
        var display_parent = document.getElementById ( 'bmlt_admin_meeting_editor_new_meeting_editor_display' );
        var new_meeting_button = document.getElementById ( 'bmlt_admin_meeting_editor_form_new_meeting_button' );
        var cancel_new_meeting_button = document.getElementById ( 'bmlt_admin_meeting_editor_form_cancel_new_meeting_button' );
        var editor_object = document.getElementById ( 'bmlt_admin_single_meeting_editor_0_div' );
        
        if ( !editor_object.dirty_flag || (editor_object.dirty_flag && confirm ( g_meeting_closure_confirm_text )) )
            {
            if ( editor_object && editor_object.main_map )
                {
                if ( editor_object.main_map.main_marker )
                    {
                    editor_object.main_map.main_marker.setMap ( null );
                    editor_object.main_map.main_marker = null;
                    };
                editor_object.main_map = null;
                };
            
            display_parent.removeChild ( editor_object );
            editor_object.innerHTML = null;
            display_parent.innerHTML = null;
            new_meeting_button.className = 'bmlt_admin_ajax_button button';
            new_meeting_button.href = 'javascript:admin_handler_object.createANewMeetingButtonHit()';
            cancel_new_meeting_button.className = 'bmlt_admin_ajax_button button_disabled';
            cancel_new_meeting_button.href = null;
            display_parent.className = 'bmlt_admin_meeting_editor_new_meeting_editor_display item_hidden';
            };
    };
        
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.dirtifyMeeting = function (in_meeting_id       ///< The BMLT ID of the meeting that will be edited. If null, then it is a new meeting.
                                    )
    {
    };
        
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.handleNewAddressInfo = function( in_meeting_id       ///< The BMLT ID of the meeting being edited.
                                        )
    {
        var meeting_street_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_street_text_input' );
        var meeting_borough_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_borough_text_input' );
        var meeting_city_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_city_text_input' );
        var meeting_state_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_state_text_input' );
        var meeting_zip_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_zip_text_input' );
        var meeting_nation_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_nation_text_input' );

        var street_text = meeting_street_text_item.value;
        var borough_text = meeting_borough_text_item.value;
        var city_text = meeting_city_text_item.value;
        var state_text = meeting_state_text_item.value;
        var zip_text = meeting_zip_text_item.value;
        var nation_text = meeting_nation_text_item.value;

        var set_map_to_address_button = document.getElementById ( 'bmlt_admin_meeting_map_' + in_meeting_id + '_button_a' );

        if ( zip_text || borough_text || city_text || state_text || nation_text )
            {
            set_map_to_address_button.href = 'javascript:admin_handler_object.setMapToAddress(' + in_meeting_id + ')';
            set_map_to_address_button.className = 'bmlt_admin_ajax_button';
            }
        else
            {
            set_map_to_address_button.href = null;
            set_map_to_address_button.className = 'bmlt_admin_ajax_button button_disabled';
            }
    };
        
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.setMapToAddress = function( in_meeting_id       ///< The BMLT ID of the meeting being edited.
                                        )
    {
        var meeting_street_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_street_text_input' );
        var meeting_borough_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_borough_text_input' );
        var meeting_city_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_city_text_input' );
        var meeting_state_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_state_text_input' );
        var meeting_zip_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_zip_text_input' );
        var meeting_nation_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_nation_text_input' );

        var street_text = meeting_street_text_item.value;
        var borough_text = meeting_borough_text_item.value;
        var city_text = meeting_city_text_item.value;
        var state_text = meeting_state_text_item.value;
        var zip_text = meeting_zip_text_item.value;
        var nation_text = meeting_nation_text_item.value;

        if ( zip_text || borough_text || city_text || state_text || nation_text )
            {
            this.lookupLocation ( in_meeting_id );
            };
    };
        
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.lookupLocation = function( in_meeting_id       ///< The BMLT ID of the meeting that being edited.
                                    )
    {
        var the_meeting_object = this.getMeetingObjectById ( in_meeting_id );

        var editor_object = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_div' );
        var meeting_street_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_street_text_input' );
        var meeting_borough_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_borough_text_input' );
        var meeting_city_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_city_text_input' );
        var meeting_state_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_state_text_input' );
        var meeting_zip_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_zip_text_input' );
        var meeting_nation_text_item = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_nation_text_input' );

        var street_text = (meeting_street_text_item.value != meeting_street_text_item.defaultValue) ? meeting_street_text_item.value : '';
        var borough_text = (meeting_borough_text_item.value != meeting_borough_text_item.defaultValue) ? meeting_borough_text_item.value : '';
        var city_text = (meeting_city_text_item.value != meeting_city_text_item.defaultValue) ? meeting_city_text_item.value : '';
        var state_text = (meeting_state_text_item.value != meeting_state_text_item.defaultValue) ? meeting_state_text_item.value : '';
        var zip_text = (meeting_zip_text_item.value != meeting_zip_text_item.defaultValue) ? meeting_zip_text_item.value : '';
        var nation_text = (meeting_nation_text_item.value != meeting_nation_text_item.defaultValue) ? meeting_nation_text_item.value : '';
        
        if ( !nation_text )
            {
            nation_text = g_region_bias;
            };
        
        // What we do here, is try to create a readable address line to be sent off for geocoding. We just try to clean it up as much as possible.
        var address_line = sprintf ( '%s,%s,%s,%s,%s,%s', street_text, borough_text, city_text, state_text, zip_text, nation_text );
        
        address_line = address_line.replace ( /,+/g, ', ' );
        address_line = address_line.replace ( /^, /g, '' );
        address_line = address_line.replace ( /, $/g, '' );
        
        if ( address_line != ', ' )
            {
            if ( the_meeting_object.m_geocoder )
                {
                google.maps.event.removeListener ( the_meeting_object.m_geocoder );
                the_meeting_object.m_geocoder = null;
                };
        
            the_meeting_object.m_geocoder = new google.maps.Geocoder;
        
            if ( the_meeting_object.m_geocoder )
                {
                var status = the_meeting_object.m_geocoder.geocode ( { 'address' : address_line }, function ( in_geocode_response ) { admin_handler_object.sGeoCallback ( in_geocode_response, in_meeting_id ); } );
                if ( google.maps.OK != status )
                    {
                    alert ( g_meeting_lookup_failed );
                    }
                else
                    {
                    };
                }
            else
                {
                alert ( g_meeting_lookup_failed );
                };
            };
    };
    /****************************************************************************************//**
    *   \brief This catches the AJAX response, and fills in the response form.                  *
    ********************************************************************************************/
    
    this.sGeoCallback = function (  in_geocode_response,    ///< The JSON object.
                                    in_meeting_id           ///< The ID of the meeting.
                                    )
    {
        var meeting_editor = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + parseInt ( in_meeting_id ) + '_div' );

        if ( meeting_editor && meeting_editor.main_map )
            {
            var the_meeting_object = meeting_editor.meeting_object;

            google.maps.event.removeListener ( the_meeting_object.m_geocoder );
            the_meeting_object.m_geocoder = null;
            if ( in_geocode_response && in_geocode_response.length && (google.maps.OK == in_geocode_response[0].status) )
                {
                the_meeting_object.longitude = in_geocode_response[0].geometry.location.lng();
                the_meeting_object.latitude = in_geocode_response[0].geometry.location.lat();
        
                var map_center = new google.maps.LatLng ( the_meeting_object.latitude, the_meeting_object.longitude );
                meeting_editor.main_map.panTo ( map_center );
                this.displayMainMarkerInMap ( in_meeting_id );
                };
            };
    };
    
    /************************************************************************************//**
    *   \brief  This creates a new meeting details editor screen.                           *
    *   \returns    A new DOM hierarchy with the initialized editor.                        *
    ****************************************************************************************/
    this.createNewMeetingEditorScreen = function(   in_parent_element,  ///< The parent element of the new instance.
                                                    in_meeting_id       ///< The BMLT ID of the meeting that will be edited. If null, then it is a new meeting.
                                                )
    {
        // We first see if one already exists.
        var new_editor = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + parseInt ( in_meeting_id ) + '_div' );
    
        if ( !new_editor )
            {
            var template_dom_list = document.getElementById ( 'bmlt_admin_single_meeting_editor_template_div' );
            
            var meeting_name_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_name_text_input';
            var meeting_cc_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_cc_text_input';
            
            var meeting_location_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_location_text_input';
            var meeting_street_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_street_text_input';
            var meeting_neighborhood_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_neighborhood_text_input';
            var meeting_borough_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_borough_text_input';
            var meeting_city_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_city_text_input';
            var meeting_county_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_county_text_input';
            var meeting_state_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_state_text_input';
            var meeting_zip_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_zip_text_input';
            var meeting_nation_text_item_id = 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_meeting_nation_text_input';
        
            if ( template_dom_list )    // This makes an exact copy of the template (including IDs, so we'll need to change those).
                {
                new_editor = template_dom_list.cloneNode ( true );
                // This function replaces all of the spots that say "template" with the given ID. That gives us unique IDs.
                BMLT_Admin_changeTemplateIDToUseThisID ( new_editor, in_meeting_id );
                new_editor.meeting_object = this.getMeetingObjectById ( in_meeting_id );
                new_editor.dirty_flag = false;
                new_editor.map_disclosed = false;
            
                new_editor.className = 'bmlt_admin_single_meeting_editor_div';
            
                in_parent_element.appendChild ( new_editor );
                            
                this.handleTextInputLoad(document.getElementById(meeting_name_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_cc_text_item_id), null, true);
                this.handleTextInputLoad(document.getElementById(meeting_location_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_street_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_neighborhood_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_borough_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_city_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_county_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_state_text_item_id));
                this.handleTextInputLoad(document.getElementById(meeting_zip_text_item_id), null, true);
                this.handleTextInputLoad(document.getElementById(meeting_nation_text_item_id));

                var meeting_am_radio_id = 'bmlt_admin_' + in_meeting_id + '_time_am_radio';
                var meeting_pm_radio_id = 'bmlt_admin_' + in_meeting_id + '_time_pm_radio';
            

                var map_disclosure_a = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_map_disclosure_a' );
                map_disclosure_a.href = 'javascript:admin_handler_object.toggleMeetingMapDisclosure(' + in_meeting_id + ')';
                };
            };
    
        return new_editor;
    };
    
    /************************************************************************************//**
    *   \brief This toggles the map disclosure.                                             *
    ****************************************************************************************/
    this.toggleMeetingMapDisclosure = function( in_meeting_id       ///< The meeting ID of the editor that gets this map.
                                                )
    {
        var root_element = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_div' );
        var map_disclosure_div = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_map_disclosure_div' );
        var map_div = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_map_div' );
        
        root_element.map_disclosed = !root_element.map_disclosed;

        map_disclosure_div.className = 'bmlt_admin_single_meeting_disclosure_map_div' + (root_element.map_disclosed ? '_open' : '_closed');
        map_div.className = 'bmlt_admin_single_meeting_map_div' + (root_element.map_disclosed ? '' : ' item_hidden');
        
        if ( root_element.map_disclosed && !root_element.main_map )
            {
            root_element.main_map = this.createEditorMap ( root_element, in_meeting_id );
            };
    };
    
    /************************************************************************************//**
    *   \brief This creates the map for the editor.                                         *
    *   \returns the map object.                                                            *
    ****************************************************************************************/
    this.createEditorMap = function(    in_editor_parent,   ///< The main editor div object.
                                        in_meeting_id       ///< The meeting ID of the editor that gets this map.
                                    )
    {
        var meeting_map_holder = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_inner_map_div' );
        var map_center = new google.maps.LatLng ( in_editor_parent.meeting_object.latitude, in_editor_parent.meeting_object.longitude );

        var myOptions = {
                        'center': map_center,
                        'zoom': in_editor_parent.meeting_object.zoom,
                        'mapTypeId': google.maps.MapTypeId.ROADMAP,
                        'mapTypeControlOptions': { 'style': google.maps.MapTypeControlStyle.DROPDOWN_MENU },
                        'zoomControl': true,
                        'mapTypeControl': true,
                        'disableDoubleClickZoom' : true,
                        'draggableCursor': "crosshair",
                        'scaleControl' : true
                        };

        myOptions.zoomControlOptions = { 'style': google.maps.ZoomControlStyle.LARGE };

        in_editor_parent.m_main_map = new google.maps.Map ( meeting_map_holder, myOptions );
    
        if ( in_editor_parent.m_main_map )
            {
            in_editor_parent.m_main_map.setOptions({'scrollwheel': false});   // For some reason, it ignores setting this in the options.
            google.maps.event.addListener ( in_editor_parent.m_main_map, 'click', function(in_event) { admin_handler_object.respondToMapClick( in_event, in_meeting_id ); } );
            google.maps.event.addListener ( in_editor_parent.m_main_map, 'tilesloaded', function(in_event) { admin_handler_object.tilesLoaded( in_meeting_id ); } );
            this.displayMainMarkerInMap ( in_meeting_id );
            };
            
        return ( in_editor_parent.m_main_map );
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.tilesLoaded = function(in_meeting_id   ///< The meeting this map is associated with.
                                )
    {
        this.displayMainMarkerInMap ( in_meeting_id );
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.respondToMapClick = function(  in_event,       ///< The Google Maps event
                                        in_meeting_id   ///< The meeting this map is associated with.
                                    )
    {
        var root_element = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_div' );
        var map_center = in_event.latLng;
        root_element.main_map.panTo ( map_center );
        this.displayMainMarkerInMap ( in_meeting_id );
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.respondToMarkerDragEnd = function( in_event,       ///< The Google Maps event
                                            in_meeting_id   ///< The meeting this map is associated with.
                                            )
    {
        var root_element = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_div' );
        var map_center = in_event.latLng;
        root_element.main_map.panTo ( map_center );
    };

    /************************************************************************************//**
    *	\brief This displays the "Your Position" marker in the results map.                 *
    ****************************************************************************************/
    this.displayMainMarkerInMap = function (    in_meeting_id   ///< The meeting this map is associated with.
                                            )
    {
        var root_element = document.getElementById ( 'bmlt_admin_single_meeting_editor_' + in_meeting_id + '_div' );

        if ( root_element && root_element.main_map )
            {
            if ( root_element.main_map.main_marker )
                {
                root_element.main_map.main_marker.setMap ( null );
                root_element.main_map.main_marker = null;
                };
            
	        m_icon_image_selected = new google.maps.MarkerImage ( g_style_dir + "/images/google_map_images/NAMarkerSel.png", new google.maps.Size(34, 38), new google.maps.Point(0,0), new google.maps.Point(18, 38) );
	        m_icon_shadow = new google.maps.MarkerImage( g_style_dir + "/images/google_map_images/NAMarkerS.png", new google.maps.Size(43, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );

            root_element.main_map.main_marker = new google.maps.Marker ({
                                                                        'position':     root_element.main_map.getCenter(),
                                                                        'map':		    root_element.main_map,
                                                                        'shadow':		m_icon_image_selected,
                                                                        'icon':			m_icon_shadow,
                                                                        'clickable':	false,
                                                                        'cursor':		'pointer',
                                                                        'draggable':    true,
                                                                        'raiseOnDrag':  false
                                                                        } );
            google.maps.event.addListener ( root_element.main_map.main_marker, 'dragend', function(in_event) { admin_handler_object.respondToMarkerDragEnd( in_event, in_meeting_id ); } );
            };
    };
    
    /************************************************************************************//**
    *   \brief  Selecte the search specifier tab.                                           *
    ****************************************************************************************/
    this.selectSearchSpecifierTab = function()
    {
        var tab_specifier_element = document.getElementById ( 'bmlt_admin_meeting_editor_tab_specifier_div' );
        var tab_editor_element = document.getElementById ( 'bmlt_admin_meeting_editor_tab_results_div' );
        var tab_specifier_link = document.getElementById ( 'bmlt_admin_meeting_editor_tab_specifier_a' );
        var tab_editor_link = document.getElementById ( 'bmlt_admin_meeting_editor_tab_results_a' );
        var search_specifier_element = document.getElementById ( 'bmlt_admin_meeting_editor_form_specifier_div' );
        var meeting_editor_element = document.getElementById ( 'bmlt_admin_meeting_editor_form_div' );
        
        tab_specifier_element.className = 'bmlt_admin_tab_div_left bmlt_admin_tab_div_selected';
        tab_editor_element.className = 'bmlt_admin_tab_div_right bmlt_admin_tab_div_not_selected';
        
        tab_specifier_link.href = null;
        tab_editor_link.href = 'javascript:admin_handler_object.selectMeetingEditorTab()';
        
        search_specifier_element.className = 'bmlt_admin_meeting_editor_form_specifier_div';
        meeting_editor_element.className = 'bmlt_admin_meeting_editor_form_div item_hidden';
    }
    
    /************************************************************************************//**
    *   \brief  Selecte the meeting editor tab.                                             *
    ****************************************************************************************/
    this.selectMeetingEditorTab = function()
    {
        var tab_specifier_element = document.getElementById ( 'bmlt_admin_meeting_editor_tab_specifier_div' );
        var tab_editor_element = document.getElementById ( 'bmlt_admin_meeting_editor_tab_results_div' );
        var tab_specifier_link = document.getElementById ( 'bmlt_admin_meeting_editor_tab_specifier_a' );
        var tab_editor_link = document.getElementById ( 'bmlt_admin_meeting_editor_tab_results_a' );
        var search_specifier_element = document.getElementById ( 'bmlt_admin_meeting_editor_form_specifier_div' );
        var meeting_editor_element = document.getElementById ( 'bmlt_admin_meeting_editor_form_div' );
        
        tab_specifier_element.className = 'bmlt_admin_tab_div_left bmlt_admin_tab_div_not_selected';
        tab_editor_element.className = 'bmlt_admin_tab_div_right bmlt_admin_tab_div_selected';
        
        tab_specifier_link.href = 'javascript:admin_handler_object.selectSearchSpecifierTab()';
        tab_editor_link.href = null;
        
        search_specifier_element.className = 'bmlt_admin_meeting_editor_form_specifier_div item_hidden';
        meeting_editor_element.className = 'bmlt_admin_meeting_editor_form_div';
    }
    
    /************************************************************************************//**
    *   \brief  This makes sure that the "All" checkbox syncs with the weekdays.            *
    ****************************************************************************************/
    this.handleWeekdayCheckBoxChanges = function(   in_checkbox_index ///< The checkbox that triggered the call.
                                                )
    {
        var all_checkbox = document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_0' );
        var weekday_checkboxes = new Array (document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_1' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_2' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_3' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_4' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_5' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_6' ),
                                            document.getElementById ( 'bmlt_admin_meeting_search_weekday_checkbox_7' ) );
        
        if ( in_checkbox_index )
            {
            var weekday_selected = false;
            for ( var c = 0; c < 7; c++ )
                {
                if ( weekday_checkboxes[c].checked )
                    {
                    weekday_selected = true;
                    };
                };
            
            all_checkbox.checked = !weekday_selected;
            }
        else
            {
            all_checkbox.checked = true;
            
            for ( var c = 0; c < 7; c++ )
                {
                weekday_checkboxes[c].checked = false;
                };
            };
            
        if ( all_checkbox.checked )
            {
            for ( var c = 0; c < 7; c++ )
                {
                weekday_checkboxes[c].checked = true;
                };
            };
    };
    
    /************************************************************************************//**
    *   \brief  This handles Service body checkboxes.                                       *
    ****************************************************************************************/
    this.handleServiceCheckBoxChanges = function(   in_service_body_id ///< The checkbox that triggered the call.
                                                )
    {
        var the_checkbox = document.getElementById ( 'bmlt_admin_meeting_search_service_body_checkbox_' + in_service_body_id );
        
        if ( the_checkbox )
            {
            var my_children = this.getServiceBodyChildren(in_service_body_id);
        
            for ( var c = 0; my_children && (c < my_children.length); c++ )
                {
                var child_id = my_children[c][0];
                var child_checkbox = document.getElementById ( 'bmlt_admin_meeting_search_service_body_checkbox_' + child_id );
                if ( child_checkbox )
                    {
                    child_checkbox.checked = the_checkbox.checked;
                    this.handleServiceCheckBoxChanges ( child_id );
                    };
                };
            };
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.getServiceBodyParentID = function( in_service_body_id 
                                            )
    {
        var the_object = null;
        
        for ( var c = 0; c < g_service_bodies_array.length; c++ )
            {
            if ( g_service_bodies_array[c][0] == in_service_body_id )
                {
                the_object = g_service_bodies_array[c];
                break;
                };
            };
        
        return the_object[1];
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.getServiceBodyChildren = function( in_service_body_id 
                                            )
    {
        var ret_array = null;
        
        for ( var c = 0; c < g_service_bodies_array.length; c++ )
            {
            if ( this.getServiceBodyParentID(g_service_bodies_array[c][0]) == in_service_body_id )
                {
                if ( ! ret_array )
                    {
                    ret_array = new Array();
                    };
                
                ret_array[ret_array.length] = g_service_bodies_array[c];
                };
            };
        
        return ret_array;
    };
    
    /************************************************************************************//**
    *   \brief  
    ****************************************************************************************/
    this.getServiceBodyName = function( in_service_body_id 
                                        )
    {
        var the_object = null;
        
        for ( var c = 0; c < g_service_bodies_array.length; c++ )
            {
            if ( g_service_bodies_array[c][0] == in_service_body_id )
                {
                the_object = g_service_bodies_array[c];
                break;
                };
            };
        
        return the_object[2];
    };
    
    /************************************************************************************//**
    *   \brief  Displays the Search Specifier, and hides any search results.                *
    ****************************************************************************************/
    this.showSearchSpecifier = function()
    {
        this.m_search_specifier_shown = true;
        this.setSearchResultsVisibility();
    };
    
    /************************************************************************************//**
    *   \brief  Displays the Search Specifier, and hides any search results.                *
    ****************************************************************************************/
    this.showSearchResults = function()
    {
        // No search results, no visible results div.
        this.m_search_specifier_shown = (this.m_search_results ? false : true);
        this.setSearchResultsVisibility();
    };
    
    /************************************************************************************//**
    *   \brief  Displays the Search Results or specifier, dependent upon the switch.        *
    ****************************************************************************************/
    this.setSearchResultsVisibility = function()
    {
        var search_specifier_div = document.getElementById ( 'bmlt_admin_meeting_editor_form_specifier_div' );
        var search_results_div = document.getElementById ( 'bmlt_admin_meeting_editor_form_results_div' );
        
        if ( this.m_search_specifier_shown )
            {
            search_specifier_div.className = 'bmlt_admin_meeting_editor_form_specifier_div';
            search_results_div.className = 'bmlt_admin_meeting_editor_form_results_div item_hidden';
            }
        else
            {
            search_specifier_div.className = 'bmlt_admin_meeting_editor_form_specifier_div item_hidden';
            search_results_div.className = 'bmlt_admin_meeting_editor_form_results_div';
            };
    };
    
    /************************************************************************************//**
    *   \brief  Returns an object with the meeting data for the meeting ID passed in.       *
    *   \returns a meeting object. Null if none found, or invalid ID.                       *
    ****************************************************************************************/
    this.getMeetingObjectById = function ( in_meeting_id    ///< The ID of the meeting to fetch
                                            )
    {
        var ret = null;
        
        if ( in_meeting_id && this.m_meeting_objects && this.m_meeting_objects.length )
            {
            for ( var c = 0; c < this.m_meeting_objects.length; c++ )
                {
                if ( in_meeting_id == this.m_meeting_objects[c].id_bigint )
                    {
                    ret = this.m_meeting_objects[c];
                    break;
                    };
                };
            };
        
        if ( !ret ) // If we did not find the meeting, we create a placeholder for it.
            {
            ret = new Object;
            ret.longitude = g_default_longitude;
            ret.latitude = g_default_latitude;
            ret.zoom = g_default_zoom;
            ret.id_bigint = parseInt ( in_meeting_id ); // Just to make sure it is a number (0 is a number. null is NaN).
            
            if ( !this.m_meeting_objects )  // We make a meeting objects array, if none previously existed.
                {
                this.m_meeting_objects = new Array;
                };
                
            this.m_meeting_objects[this.m_meeting_objects.length] = ret;
            };
            
        return ret;
    };

    /************************************************************************************//**
    *                                     CONSTRUCTOR                                       *
    ****************************************************************************************/
    this.m_account_panel_shown = false;
    this.m_search_specifier_shown = true;
    this.m_meeting_editor_panel_shown = false;
    this.m_success_fade_duration = 2000;        ///< 2 seconds for a success fader.
    this.m_failure_fade_duration = 5000;        ///< 5 seconds for a success fader.
};

var admin_handler_object = new BMLT_Server_Admin;

/********************************************************************************************
*###################################### AJAX HANDLER #######################################*
********************************************************************************************/

/****************************************************************************************//**
*   \brief A simple, generic AJAX request function.                                         *
*                                                                                           *
*   \returns a new XMLHTTPRequest object.                                                   *
********************************************************************************************/
    
function BMLT_AjaxRequest ( url,        ///< The URI to be called
                            callback,   ///< The success callback
                            method,     ///< The method ('get' or 'post')
                            extra_data  ///< If supplied, extra data to be delivered to the callback.
                            )
{
    /************************************************************************************//**
    *   \brief Create a generic XMLHTTPObject.                                              *
    *                                                                                       *
    *   This will account for the various flavors imposed by different browsers.            *
    *                                                                                       *
    *   \returns a new XMLHTTPRequest object.                                               *
    ****************************************************************************************/
    
    function createXMLHTTPObject()
    {
        var XMLHttpArray = [
            function() {return new XMLHttpRequest()},
            function() {return new ActiveXObject("Msxml2.XMLHTTP")},
            function() {return new ActiveXObject("Msxml2.XMLHTTP")},
            function() {return new ActiveXObject("Microsoft.XMLHTTP")}
            ];
            
        var xmlhttp = false;
        
        for ( var i=0; i < XMLHttpArray.length; i++ )
            {
            try
                {
                xmlhttp = XMLHttpArray[i]();
                }
            catch(e)
                {
                continue;
                };
            break;
            };
        
        return xmlhttp;
    };
    
    var req = createXMLHTTPObject();
    req.finalCallback = callback;
    var sVars = null;
    method = method.toString().toUpperCase();
    var drupal_kludge = '';
    
    // Split the URL up, if this is a POST.
    if ( method == "POST" )
        {
        var rmatch = /^([^\?]*)\?(.*)$/.exec ( url );
        url = rmatch[1];
        sVars = rmatch[2];
        // This horrible, horrible kludge, is because Drupal insists on having its q parameter in the GET list only.
        var rmatch_kludge = /(q=admin\/settings\/bmlt)&?(.*)/.exec ( rmatch[2] );
        if ( rmatch_kludge && rmatch_kludge[1] )
            {
            url += '?'+rmatch_kludge[1];
            sVars = rmatch_kludge[2];
            };
        };
    if ( extra_data )
        {
        req.extra_data = extra_data;
        };
    req.open ( method, url, true );
    if ( method == "POST" )
        {
        req.setRequestHeader("Method", "POST "+url+" HTTP/1.1");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        };
    req.onreadystatechange = function ( )
        {
        if ( req.readyState != 4 ) return;
        if( req.status != 200 ) return;
        callback ( req, req.extra_data );
        req = null;
        };
    req.send ( sVars );
    
    return req;
};

/********************************************************************************************
*#################################### UTILITY FUNCTIONS ####################################*
********************************************************************************************/

/****************************************************************************************//**
*   \brief Starts the message "fader."                                                      *
*                                                                                           *
*   Simple fader, taken from here:                                                          *
*       http://www.switchonthecode.com/tutorials/javascript-tutorial-simple-fade-animation  *
********************************************************************************************/
function BMLT_Admin_StartFader( in_eid,         ///< The element ID to be faded.
                                in_fade_time    ///< The number of seconds to fade.
                                )
{
    var in_element = document.getElementById( in_eid );
    if ( in_element )
        {
        in_element.className = 'bmlt_admin_fader_div';
        in_element.FadeTimeTotal = in_fade_time;
        in_element.FadeTimeLeft = in_element.FadeTimeTotal;
        setTimeout ( "BMLT_Admin_animateFade(" + new Date().getTime() + ",'" + in_eid + "')", 33);
        };
};

/****************************************************************************************//**
*   \brief Animates the fade.                                                               *
*                                                                                           *
*   Simple fader, taken from here:                                                          *
*       http://www.switchonthecode.com/tutorials/javascript-tutorial-simple-fade-animation  *
********************************************************************************************/
function BMLT_Admin_animateFade (   lastTick,       ///< The time of the last tick.
                                    in_eid          ///< The element ID
                                )
{  
    var in_element = document.getElementById( in_eid );
    if ( in_element )
        {
        var curTick = new Date().getTime();
        var elapsedTicks = curTick - lastTick;
    
        if ( in_element.FadeTimeLeft <= elapsedTicks )
            {
            in_element.className = 'bmlt_admin_fader_div item_hidden';
            in_element.FadeTimeTotal = null;
            in_element.FadeTimeLeft = null;
            in_element.FadeState = null;
            in_element.style.opacity = null;
            in_element.style.filter = null;
            return;
            };
    
        in_element.FadeTimeLeft -= elapsedTicks;
    
        var newOpVal = in_element.FadeTimeLeft/in_element.FadeTimeTotal;
    
        in_element.style.opacity = newOpVal;
        in_element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';
    
        setTimeout ( "BMLT_Admin_animateFade(" + curTick + ",'" + in_eid + "')", 33 );
        };
};

/****************************************************************************************//**
*   \brief This allows you to get objects within a DOM node hierarchy that have a certain   *
*          element name (type, such as 'div' or 'a'), and a className.                      *
*          This can be used to "drill into" a DOM hierarchy that doesn't have IDs.          *
*   \returns an array of DOM elements that meet the criteria.                               *
********************************************************************************************/
function BMLT_Admin_getChildElementsByClassName (   in_container_element,   ///< The DOM node that contains the hierarchy
                                                    in_element_type,        ///< The type of node that you are seeking.
                                                    in_element_className    ///< The className for that element.
                                                    )
{
    var starting_pool = in_container_element.getElementsByTagName ( in_element_type );
    var ret = [];
    for ( c = 0; c < starting_pool.length; c++)
        {
        if ( starting_pool[c].className == in_element_className )
            {
            ret.append ( starting_pool[c] );
            };
        
        var ret2 = BMLT_Admin_getChildElementsByClassName ( starting_pool[c], in_element_type, in_element_className );
        
        if ( ret2 && ret2.length )
            {
            ret = ret.concat ( ret2 );
            };
        };

    return ret;
};

/****************************************************************************************//**
*   \brief This allows you to search a particular DOM hierarchy for an element with an ID.  *
*          This is useful for changing Node IDs in the case of cloneNode().                 *
*   \returns a single DOM element, with the given ID.                                       *
********************************************************************************************/
function BMLT_Admin_getChildElementById (   in_container_element,   ///< The DOM node that contains the hierarchy
                                            in_element_id           ///< The ID you are looking for.
                                            )
{
    var ret = null;
    
    if ( in_container_element && in_container_element.id == in_element_id ) // Low-hanging fruit.
        {
        ret = in_container_element;
        }
    else
        {
        // If we have kids, we check each of them for the ID.
        if ( in_container_element && in_container_element.childNodes && in_container_element.childNodes.length )
            {
            for ( var c = 0; c < in_container_element.childNodes.length; c++ )
                {
                ret = BMLT_Admin_getChildElementsById ( in_container_element.childNodes[c], in_element_id );
                
                if ( ret )
                    {
                    break;
                    };
                };
            };
        };
    
    return ret;
};

/****************************************************************************************//**
*   \brief This replaces every instance of 'template' in a hierarchy's element ids with the *
*          the given ID.                                                                    *
********************************************************************************************/
function BMLT_Admin_changeTemplateIDToUseThisID (   in_container_element,   ///< The DOM node that contains the hierarchy
                                                    in_element_id           ///< The ID you are replacing with.
                                                    )
{
    var ret = null;
    
    if ( in_container_element )
        {
        if ( in_container_element.attributes && in_container_element.attributes.length )
            {
            for ( var c = 0; c < in_container_element.attributes.length; c++ )
                {
                if ( (in_container_element.attributes[c].name == 'name') || (in_container_element.attributes[c].name == 'for') )
                    {
                    in_container_element.attributes[c].value = in_container_element.attributes[c].value.replace( 'template', in_element_id );
                    };
                };
            };
        
        if ( in_container_element.id )
            {
            in_container_element.id = in_container_element.id.replace( 'template', in_element_id );
            };
        };
        
    // If we have kids, we check each of them for the ID.
    if ( in_container_element && in_container_element.childNodes && in_container_element.childNodes.length )
        {
        for ( var c = 0; c < in_container_element.childNodes.length; c++ )
            {
            BMLT_Admin_changeTemplateIDToUseThisID ( in_container_element.childNodes[c], in_element_id );
            };
        };
    
    return ret;
};

/********************************************************************************************
*###################################### THIRD-PARTY CODE ###################################*
********************************************************************************************/
/**
sprintf() for JavaScript 0.6

Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of sprintf() for JavaScript nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


Changelog:
2007.04.03 - 0.1:
 - initial release
2007.09.11 - 0.2:
 - feature: added argument swapping
2007.09.17 - 0.3:
 - bug fix: no longer throws exception on empty paramenters (Hans Pufal)
2007.10.21 - 0.4:
 - unit test and patch (David Baird)
2010.05.09 - 0.5:
 - bug fix: 0 is now preceeded with a + sign
 - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
 - switched from GPL to BSD license
2010.05.22 - 0.6:
 - reverted to 0.4 and fixed the bug regarding the sign of the number 0
 Note:
 Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
 who warned me about a bug in 0.5, I discovered that the last update was
 a regress. I appologize for that.
**/

function sprintf()
{
    function str_repeat(i, m)
    {
        for (var o = []; m > 0; o[--m] = i);
        return o.join('');
    };

    var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
    
    while (f)
        {
        if (m = /^[^\x25]+/.exec(f))
            {
            o.push(m[0]);
            }
        else if (m = /^\x25{2}/.exec(f))
            {
            o.push('%');
            }
        else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f))
            {
            if (((a = arguments[m[1] || i++]) == null) || (a == undefined))
                {
                throw('Too few arguments.');
                };
            
            if (/[^s]/.test(m[7]) && (typeof(a) != 'number'))
                {
                throw('Expecting number but found ' + typeof(a));
                };
            
            switch (m[7])
                {
                case 'b': a = a.toString(2); break;
                case 'c': a = String.fromCharCode(a); break;
                case 'd': a = parseInt(a,10); break;
                case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
                case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
                case 'o': a = a.toString(8); break;
                case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
                case 'u': a = Math.abs(a); break;
                case 'x': a = a.toString(16); break;
                case 'X': a = a.toString(16).toUpperCase(); break;
                };
            
            a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+'+ a : a);
            c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
            x = m[5] - String(a).length - s.length;
            p = m[5] ? str_repeat(c, x) : '';
            o.push(s + (m[4] ? a + p : p + a));
            }
        else
            {
            throw('Huh ?!');
            };
        
        f = f.substring(m[0].length);
        };
    
    return o.join('');
};