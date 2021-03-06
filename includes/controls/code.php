<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Radio Buttons controls.
 *
 * @property array $language  Any language(mode) supported by Ace editor. @see https://ace.c9.io/build/kitchen-sink.html
 *                            Default 'html'
 *
 * @since 1.0.0
 */
class Control_Code extends Control_Base {

	public function get_type() {
		return 'code';
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
			'language' => 'html', // html/css
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<textarea rows="10" class="elementor-input-style elementor-code-editor" data-setting="{{ data.name }}"></textarea>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
