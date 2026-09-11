<?php
/**
 * Plugin Name:  Kastell — contenu du site
 * Description:  Modèle de contenu et route d'agrégation pour le site Next.js de Kastell Conseil. WordPress ne sert aucune page : il ne sert que des données.
 * Version:      1.10.0
 * Requires PHP: 7.4
 * Author:        Kastell Conseil
 * Text Domain:  kastell
 */

defined( 'ABSPATH' ) || exit;

/* Affichée sur la vue d'ensemble : sans elle, impossible de savoir quelle
   version est réellement installée quand un bouton attendu n'apparaît pas. */
const KASTELL_VERSION = '1.10.0';

require_once __DIR__ . '/inc/reglages.php';
require_once __DIR__ . '/inc/schema.php';
require_once __DIR__ . '/inc/types.php';
require_once __DIR__ . '/inc/metaboxes.php';
require_once __DIR__ . '/inc/svg.php';
require_once __DIR__ . '/inc/admin.php';
require_once __DIR__ . '/inc/import.php';
require_once __DIR__ . '/inc/rest.php';
require_once __DIR__ . '/inc/revalidation.php';

/**
 * WordPress est un back-office, pas un site.
 *
 * Sans cela, le domaine du back-office se retrouve indexé et entre en
 * concurrence avec le site public : même contenu à deux adresses, et c'est
 * parfois l'administration qui remonte dans les résultats.
 */
function kastell_ne_pas_indexer() {
	echo '<meta name="robots" content="noindex, nofollow" />' . "\n";
}
add_action( 'wp_head', 'kastell_ne_pas_indexer', 1 );

function kastell_robots_txt( $sortie ) {
	return "User-agent: *\nDisallow: /\n";
}
add_filter( 'robots_txt', 'kastell_robots_txt', 99 );

/** Un visiteur arrivé sur le back-office est renvoyé vers le vrai site. */
function kastell_rediriger_le_front() {
	if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}
	if ( is_user_logged_in() ) {
		return;
	}
	$site = kastell_site_url();
	if ( $site ) {
		wp_redirect( $site, 302 );
		exit;
	}
}
add_action( 'template_redirect', 'kastell_rediriger_le_front' );

/** Réécritures à rafraîchir une fois les types déclarés. */
function kastell_activation() {
	kastell_enregistrer_types();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'kastell_activation' );

function kastell_desactivation() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'kastell_desactivation' );
