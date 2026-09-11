<?php
/**
 * Rendu et enregistrement des champs.
 *
 * Un seul moteur générique, piloté par le modèle déclaré dans schema.php :
 * ajouter un champ là-bas suffit à le voir apparaître ici, sans code de plus.
 *
 * Un champ se déclare array( genre, intitulé, aide?, options? ), le quatrième
 * élément ne servant qu'aux listes de choix.
 */

defined( 'ABSPATH' ) || exit;

const KASTELL_PREFIXE = '_kastell_';

/** Toutes les définitions de champs, indexées par type de contenu. */
function kastell_champs_par_type() {
	$tout = array();
	foreach ( kastell_singletons() as $type => $def ) {
		$tout[ $type ] = $def['champs'];
	}
	foreach ( kastell_collections() as $type => $def ) {
		$tout[ $type ] = $def['champs'];
	}
	return $tout;
}

function kastell_ajouter_metaboxes() {
	foreach ( kastell_champs_par_type() as $type => $champs ) {
		if ( empty( $champs ) ) {
			continue;
		}
		add_meta_box(
			'kastell-champs',
			'Contenu',
			'kastell_rendre_metabox',
			$type,
			'normal',
			'high'
		);
	}
}
add_action( 'add_meta_boxes', 'kastell_ajouter_metaboxes' );

function kastell_rendre_metabox( $post ) {
	$champs = kastell_champs_par_type()[ $post->post_type ] ?? array();
	wp_nonce_field( 'kastell_enregistrer', 'kastell_nonce' );

	echo '<div class="kastell-champs">';
	foreach ( $champs as $cle => $def ) {
		$genre       = $def[0];
		$intitule    = $def[1];
		$description = $def[2] ?? '';
		$valeur      = get_post_meta( $post->ID, KASTELL_PREFIXE . $cle, true );
		$id          = 'kastell-' . $cle;
		$nom         = 'kastell[' . $cle . ']';

		echo '<p class="kastell-champ">';
		printf( '<label for="%s"><strong>%s</strong></label>', esc_attr( $id ), esc_html( $intitule ) );

		switch ( $genre ) {
			case 'paragraphe':
				printf(
					'<textarea id="%s" name="%s" rows="4" class="widefat">%s</textarea>',
					esc_attr( $id ),
					esc_attr( $nom ),
					esc_textarea( $valeur )
				);
				break;

			case 'lignes':
				printf(
					'<textarea id="%s" name="%s" rows="6" class="widefat">%s</textarea>',
					esc_attr( $id ),
					esc_attr( $nom ),
					esc_textarea( $valeur )
				);
				break;

			case 'liste':
				printf( '<select id="%s" name="%s" class="widefat">', esc_attr( $id ), esc_attr( $nom ) );
				foreach ( $def[3] ?? array() as $valeur_option => $libelle ) {
					printf(
						'<option value="%s"%s>%s</option>',
						esc_attr( $valeur_option ),
						selected( $valeur, $valeur_option, false ),
						esc_html( $libelle )
					);
				}
				echo '</select>';
				break;

			case 'image':
			case 'fichier':
				printf(
					'<span class="kastell-media"><input type="url" id="%s" name="%s" value="%s" class="widefat" readonly />'
					. '<button type="button" class="button kastell-choisir" data-cible="%s" data-genre="%s">Choisir</button>'
					. '<button type="button" class="button kastell-vider" data-cible="%s">Retirer</button></span>',
					esc_attr( $id ),
					esc_attr( $nom ),
					esc_url( $valeur ),
					esc_attr( $id ),
					esc_attr( $genre ),
					esc_attr( $id )
				);
				if ( 'image' === $genre && $valeur ) {
					printf( '<img src="%s" alt="" class="kastell-apercu" />', esc_url( $valeur ) );
				}
				break;

			default:
				printf(
					'<input type="text" id="%s" name="%s" value="%s" class="widefat" />',
					esc_attr( $id ),
					esc_attr( $nom ),
					esc_attr( $valeur )
				);
		}

		if ( $description ) {
			printf( '<span class="description">%s</span>', esc_html( $description ) );
		}
		echo '</p>';
	}
	echo '</div>';
}

function kastell_enregistrer_champs( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST['kastell_nonce'] ) ) {
		return;
	}
	$nonce = sanitize_text_field( wp_unslash( $_POST['kastell_nonce'] ) );
	if ( ! wp_verify_nonce( $nonce, 'kastell_enregistrer' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$champs = kastell_champs_par_type()[ get_post_type( $post_id ) ] ?? array();
	if ( empty( $champs ) ) {
		return;
	}

	$envoye = isset( $_POST['kastell'] ) && is_array( $_POST['kastell'] )
		? wp_unslash( $_POST['kastell'] )
		: array();

	foreach ( $champs as $cle => $def ) {
		$brut = isset( $envoye[ $cle ] ) ? (string) $envoye[ $cle ] : '';

		switch ( $def[0] ) {
			case 'paragraphe':
			case 'lignes':
				$valeur = sanitize_textarea_field( $brut );
				break;
			case 'liste':
				$valeur = array_key_exists( $brut, $def[3] ?? array() ) ? $brut : '';
				break;
			case 'image':
			case 'fichier':
				$valeur = esc_url_raw( $brut );
				break;
			default:
				$valeur = sanitize_text_field( $brut );
		}

		if ( '' === $valeur ) {
			delete_post_meta( $post_id, KASTELL_PREFIXE . $cle );
		} else {
			update_post_meta( $post_id, KASTELL_PREFIXE . $cle, $valeur );
		}
	}
}
add_action( 'save_post', 'kastell_enregistrer_champs' );

/** Sélecteur de médiathèque et mise en forme, chargés seulement sur nos écrans. */
function kastell_assets( $hook ) {
	global $typenow;
	if ( ! isset( kastell_champs_par_type()[ $typenow ] ) ) {
		return;
	}
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	wp_enqueue_media();
	wp_add_inline_style(
		'common',
		'.kastell-champ{display:block;margin:0 0 22px}'
		. '.kastell-champ label{display:block;margin-bottom:6px}'
		. '.kastell-champ .description{display:block;margin-top:5px}'
		. '.kastell-media{display:flex;gap:8px;align-items:center}'
		. '.kastell-media input{flex:1}'
		. '.kastell-apercu{display:block;max-width:220px;max-height:120px;width:auto;height:auto;margin-top:10px;border:1px solid #dcdcde}'
	);
	wp_add_inline_script(
		'media-editor',
		<<<'JS'
jQuery(function ($) {
  var cadres = {};
  $(document).on('click', '.kastell-choisir', function () {
    var cible = $(this).data('cible');
    var genre = $(this).data('genre');
    if (!cadres[cible]) {
      cadres[cible] = wp.media({
        title: genre === 'image' ? 'Choisir une image' : 'Choisir un document',
        library: genre === 'image' ? { type: 'image' } : {},
        button: { text: 'Utiliser ce fichier' },
        multiple: false
      });
      cadres[cible].on('select', function () {
        var fichier = cadres[cible].state().get('selection').first().toJSON();
        $('#' + cible).val(fichier.url);
        $('#' + cible).closest('.kastell-champ').find('.kastell-apercu').remove();
        if (genre === 'image') {
          $('#' + cible).closest('.kastell-champ')
            .append($('<img class="kastell-apercu" alt="">').attr('src', fichier.url));
        }
      });
    }
    cadres[cible].open();
  });

  $(document).on('click', '.kastell-vider', function () {
    var cible = $(this).data('cible');
    $('#' + cible).val('');
    $('#' + cible).closest('.kastell-champ').find('.kastell-apercu').remove();
  });
});
JS
	);
}
add_action( 'admin_enqueue_scripts', 'kastell_assets' );
