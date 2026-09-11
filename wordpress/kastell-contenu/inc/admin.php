<?php
/**
 * Ergonomie de l'administration.
 *
 * L'éditrice ne connaît pas WordPress. Tout ce fichier vise un seul objectif :
 * qu'elle n'ait jamais à deviner. On lui montre les rubriques du site et rien
 * d'autre, chaque écran dit à quoi il sert, et l'ordre d'affichage se règle en
 * déplaçant les lignes plutôt qu'en saisissant des numéros.
 */

defined( 'ABSPATH' ) || exit;

/** Définition complète d'un type, rubrique unique ou liste. */
function kastell_definition( $type ) {
	$tout = kastell_singletons() + kastell_collections();
	return $tout[ $type ] ?? null;
}

/* -------------------------------------------------------------------------
 * Vue d'ensemble
 * ---------------------------------------------------------------------- */

function kastell_page_accueil() {
	$lie = kastell_est_lie();

	echo '<div class="wrap kastell-accueil">';
	echo '<h1>Contenu du site</h1>';
	echo '<p class="kastell-chapo">Chaque encadré ci-dessous correspond à une partie du site. Modifiez, cliquez sur <strong>Mettre à jour</strong> : le site se met à jour tout seul en moins d’une minute.</p>';

	kastell_bilan_import();
	kastell_bilan_maj();
	kastell_bloc_import();

	echo '<h2>Les textes</h2><div class="kastell-cartes">';
	foreach ( kastell_singletons() as $type => $def ) {
		$id = kastell_id_singleton( $type );
		printf(
			'<a class="kastell-carte" href="%s"><strong>%s</strong><span>%s</span></a>',
			esc_url( admin_url( 'post.php?post=' . $id . '&action=edit' ) ),
			esc_html( $def['menu'] ),
			esc_html( $def['aide'] ?? '' )
		);
	}
	echo '</div>';

	echo '<h2>Les listes</h2><div class="kastell-cartes">';
	foreach ( kastell_collections() as $type => $def ) {
		$nombre = (int) wp_count_posts( $type )->publish;
		printf(
			'<a class="kastell-carte" href="%s"><strong>%s <em>(%d)</em></strong><span>%s</span></a>',
			esc_url( admin_url( 'edit.php?post_type=' . $type ) ),
			esc_html( $def['titre'] ),
			$nombre,
			esc_html( $def['aide'] ?? '' )
		);
	}
	echo '</div>';

	echo '<h2>Liaison avec le site</h2>';

	$url_ok    = '' !== kastell_site_url();
	$secret_ok = '' !== kastell_secret();
	$maj       = kastell_lien_maj();
	$apercu    = kastell_lien_apercu();

	/* Les boutons sont toujours affichés, désactivés le cas échéant : les
	   masquer quand la configuration manque laisse chercher une fonction qui
	   existe pourtant, sans jamais dire ce qui lui manque. */
	echo '<p class="kastell-actions">';
	if ( $maj ) {
		printf( '<a href="%s" class="button button-primary button-hero">Mettre le site à jour</a>', esc_url( $maj ) );
		printf( '<a href="%s" class="button button-hero" target="_blank" rel="noopener">Voir l’aperçu du site</a>', esc_url( $apercu ) );
	} else {
		echo '<span class="button button-primary button-hero disabled" aria-disabled="true">Mettre le site à jour</span>';
		echo '<span class="button button-hero disabled" aria-disabled="true">Voir l’aperçu du site</span>';
	}
	echo '</p>';

	if ( $maj ) {
		printf(
			'<p>Site public : <a href="%1$s" target="_blank" rel="noopener">%1$s</a>.</p>',
			esc_url( kastell_site_url() )
		);
		$derniere = (int) get_option( 'kastell_derniere_maj', 0 );
		if ( $derniere ) {
			printf(
				'<p class="description">Dernière mise à jour poussée il y a %s.</p>',
				esc_html( human_time_diff( $derniere ) )
			);
		}
		echo '<p class="description"><strong>Mettre le site à jour</strong> pousse vos modifications sur le site public tout de suite. Ce n’est pas obligatoire : le site se rafraîchit aussi tout seul en moins d’une minute. <strong>L’aperçu</strong> montre le résultat dans votre navigateur seulement, sans rien changer pour les visiteurs. Les deux raccourcis restent disponibles en haut de chaque écran.</p>';
	} else {
		kastell_expliquer_constantes( $url_ok, $secret_ok );
	}

	printf(
		'<p class="description">Vérification technique : <a href="%1$s" target="_blank" rel="noopener">%1$s</a> doit afficher du texte en JSON. Extension version %2$s.</p>',
		esc_url( rest_url( 'kastell/v1/contenu' ) ),
		esc_html( KASTELL_VERSION )
	);
	echo '</div>';
}

/**
 * Ce qui manque, et de quoi le renseigner sur place.
 *
 * La version précédente donnait un extrait de wp-config.php à coller. C'est la
 * bonne pratique WordPress, mais elle suppose un accès au système de fichiers
 * que la personne qui gère le contenu n'a pas : les boutons restaient inactifs
 * faute de pouvoir ouvrir un fichier.
 */
function kastell_expliquer_constantes( $url_ok, $secret_ok ) {
	$manquantes = array();
	if ( ! $url_ok ) {
		$manquantes[] = 'l’adresse du site public';
	}
	if ( ! $secret_ok ) {
		$manquantes[] = 'le secret partagé';
	}

	echo '<div class="kastell-alerte">';
	printf(
		'<p><strong>Ces deux boutons sont inactifs</strong> : il manque %s. Renseignez-%s ci-dessous.</p>',
		esc_html( implode( ' et ', $manquantes ) ),
		count( $manquantes ) > 1 ? 'les' : 'le'
	);
	echo '<p>Sans cela le site fonctionne quand même : vos modifications s’y affichent en moins d’une minute, au lieu d’être poussées d’un clic.</p>';
	echo '</div>';
	kastell_formulaire_reglages();
}

/** Rappel discret sur tous les écrans, tant que la liaison n'est pas faite. */
function kastell_avis_constantes() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	if ( kastell_est_lie() ) {
		return;
	}
	$ecran = get_current_screen();
	if ( $ecran && 'toplevel_page_kastell-contenu' === $ecran->id ) {
		return; // la vue d'ensemble l'explique déjà en détail
	}
	if ( ! $ecran || ! kastell_definition( $ecran->post_type ) ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>Les boutons « Mettre le site à jour » et « Voir l’aperçu » sont inactifs : la liaison avec le site n’est pas renseignée. <a href="%s">La renseigner</a>.</p></div>',
		esc_url( admin_url( 'admin.php?page=kastell-contenu' ) )
	);
}
add_action( 'all_admin_notices', 'kastell_avis_constantes' );

/**
 * Proposition d'import, tant que rien n'a été saisi.
 *
 * Un back-office vide est indéchiffrable : on ne peut pas modifier un texte
 * qu'on ne voit pas. Le bloc disparaît dès que le contenu est en place.
 */
function kastell_bloc_import() {
	$id      = kastell_id_singleton( 'k_accueil' );
	$amorce  = $id ? get_post_meta( $id, KASTELL_PREFIXE . 'promesse', true ) : '';
	$demande = wp_nonce_url( admin_url( 'admin.php?page=kastell-contenu&kastell_import=1' ), 'kastell_import' );

	if ( '' !== $amorce ) {
		printf(
			'<p class="description">Le contenu est en place. <a href="%s">Compléter les champs restés vides</a> depuis les textes d’origine du site — les saisies existantes ne sont jamais écrasées.</p>',
			esc_url( $demande )
		);
		return;
	}

	echo '<div class="notice notice-info kastell-import"><h2>Commencer ici</h2>';
	echo '<p>Les rubriques sont encore vides. Récupérez les textes actuellement affichés sur le site : vous pourrez ensuite les modifier au lieu de tout saisir.</p>';
	printf( '<p><a href="%s" class="button button-primary button-hero">Récupérer les textes du site</a></p>', esc_url( $demande ) );
	echo '<p class="description">Sans danger : l’opération ne remplit que les champs vides et n’écrase jamais une saisie.</p></div>';
}

/** Compte rendu, au retour de l'import. */
function kastell_bilan_import() {
	$bilan = isset( $_GET['kastell_bilan'] ) ? sanitize_text_field( wp_unslash( $_GET['kastell_bilan'] ) ) : '';
	if ( ! $bilan ) {
		return;
	}
	if ( 'erreur' === $bilan ) {
		echo '<div class="notice notice-error"><p>Import impossible : le fichier <code>contenu-initial.json</code> est introuvable dans l’extension.</p></div>';
		return;
	}
	printf(
		'<div class="notice notice-success"><p>%d champs remplis et %d fiches créées. Vous pouvez maintenant les modifier rubrique par rubrique.</p></div>',
		isset( $_GET['champs'] ) ? (int) $_GET['champs'] : 0,
		isset( $_GET['fiches'] ) ? (int) $_GET['fiches'] : 0
	);
}

/* -------------------------------------------------------------------------
 * Aperçu du site
 * ---------------------------------------------------------------------- */

/**
 * Lien vers l'aperçu, sans exposer le secret.
 *
 * Le site est servi en pages pré-rendues : une modification met jusqu'à une
 * minute à s'y voir. L'aperçu bascule le navigateur en lecture directe. Le
 * secret est ajouté par la redirection, côté serveur, plutôt que d'être écrit
 * dans le HTML de chaque écran d'administration.
 */
function kastell_lien_apercu() {
	if ( ! kastell_est_lie() ) {
		return '';
	}
	return wp_nonce_url( admin_url( 'admin-post.php?action=kastell_apercu' ), 'kastell_apercu' );
}

function kastell_rediriger_apercu() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Droits insuffisants.' );
	}
	check_admin_referer( 'kastell_apercu' );
	if ( ! kastell_est_lie() ) {
		wp_die( 'La liaison avec le site n’est pas renseignée.' );
	}

	$url = add_query_arg(
		'secret',
		rawurlencode( kastell_secret() ),
		kastell_site_url() . '/api/apercu'
	);
	/* Destination hors du site WordPress : wp_safe_redirect la refuserait. */
	wp_redirect( $url, 302 );
	exit;
}
add_action( 'admin_post_kastell_apercu', 'kastell_rediriger_apercu' );

/** Raccourci permanent dans la barre d'administration. */
function kastell_barre_admin( $barre ) {
	if ( ! is_admin() || ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	$lien = kastell_lien_apercu();
	if ( ! $lien ) {
		return;
	}
	$maj = kastell_lien_maj();
	if ( $maj ) {
		$barre->add_node(
			array(
				'id'    => 'kastell-maj',
				'title' => 'Mettre le site à jour',
				'href'  => $maj,
				'meta'  => array( 'title' => 'Pousse vos modifications sur le site public, tout de suite' ),
			)
		);
	}

	$barre->add_node(
		array(
			'id'    => 'kastell-apercu',
			'title' => 'Voir l’aperçu du site',
			'href'  => $lien,
			'meta'  => array( 'target' => '_blank', 'title' => 'Ouvre le site en lecture directe de WordPress' ),
		)
	);
}
add_action( 'admin_bar_menu', 'kastell_barre_admin', 80 );

/* -------------------------------------------------------------------------
 * Mise à jour du site à la demande
 * ---------------------------------------------------------------------- */

/**
 * Purge le cache du site, sur commande.
 *
 * Le webhook fait déjà ce travail à chaque publication, mais il est envoyé
 * sans attendre la réponse : s'il échoue, personne ne le sait. Ce bouton fait
 * le même appel en attendant le résultat, ce qui en fait aussi le test de la
 * liaison — un secret mal recopié ou une mauvaise adresse s'y voient tout de
 * suite, au lieu de se traduire par « le site ne se met pas à jour ».
 */
function kastell_forcer_maj() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Droits insuffisants.' );
	}
	check_admin_referer( 'kastell_maj' );

	$retour = admin_url( 'admin.php?page=kastell-contenu' );

	if ( ! kastell_est_lie() ) {
		wp_safe_redirect( add_query_arg( 'kastell_maj', 'constantes', $retour ) );
		exit;
	}

	$reponse = wp_remote_post(
		kastell_site_url() . '/api/revalidate',
		array(
			'timeout'  => 15,
			'blocking' => true,
			'headers'  => array(
				'content-type'     => 'application/json',
				'x-kastell-secret' => kastell_secret(),
			),
			'body'     => wp_json_encode( array( 'origine' => 'bouton' ) ),
		)
	);

	if ( is_wp_error( $reponse ) ) {
		$retour = add_query_arg(
			array( 'kastell_maj' => 'injoignable', 'detail' => rawurlencode( $reponse->get_error_message() ) ),
			$retour
		);
	} else {
		$code   = (int) wp_remote_retrieve_response_code( $reponse );
		$etat   = 200 === $code ? 'ok' : ( 401 === $code ? 'secret' : 'erreur' );
		$retour = add_query_arg(
			array( 'kastell_maj' => $etat, 'code' => $code ),
			$retour
		);
		if ( 'ok' === $etat ) {
			update_option( 'kastell_derniere_maj', time() );
		}
	}

	wp_safe_redirect( $retour );
	exit;
}
add_action( 'admin_post_kastell_maj', 'kastell_forcer_maj' );

/** Compte rendu de la mise à jour, au retour. */
function kastell_bilan_maj() {
	$etat = isset( $_GET['kastell_maj'] ) ? sanitize_text_field( wp_unslash( $_GET['kastell_maj'] ) ) : '';
	if ( ! $etat ) {
		return;
	}

	$messages = array(
		'ok'          => array( 'success', 'Le site est à jour. Rechargez-le pour voir vos modifications.' ),
		'secret'      => array( 'error', 'Le site a refusé la demande : le secret enregistré ici ne correspond pas à la variable <code>REVALIDATE_SECRET</code> de Vercel.' ),
		'constantes'  => array( 'error', 'La liaison avec le site n’est pas renseignée.' ),
		'injoignable' => array( 'error', 'Le site n’a pas répondu. Vérifiez l’adresse du site public.' ),
		'erreur'      => array( 'error', 'Le site a répondu, mais pas ce qui était attendu.' ),
	);
	if ( ! isset( $messages[ $etat ] ) ) {
		return;
	}

	list( $genre, $texte ) = $messages[ $etat ];
	if ( isset( $_GET['code'] ) && 'ok' !== $etat ) {
		$texte .= ' (réponse ' . (int) $_GET['code'] . ')';
	}
	if ( isset( $_GET['detail'] ) && 'injoignable' === $etat ) {
		$texte .= ' <br><small>' . esc_html( sanitize_text_field( wp_unslash( $_GET['detail'] ) ) ) . '</small>';
	}
	printf( '<div class="notice notice-%s"><p>%s</p></div>', esc_attr( $genre ), wp_kses_post( $texte ) );
}

/** Lien signé vers l'action, ou chaîne vide si la liaison n'est pas configurée. */
function kastell_lien_maj() {
	if ( ! kastell_est_lie() ) {
		return '';
	}
	return wp_nonce_url( admin_url( 'admin-post.php?action=kastell_maj' ), 'kastell_maj' );
}

/* -------------------------------------------------------------------------
 * Écrans d'édition
 * ---------------------------------------------------------------------- */

/** Le champ titre porte le nom de ce qu'il contient vraiment. */
function kastell_placeholder_titre( $texte, $post ) {
	$def = kastell_definition( $post->post_type );
	return $def && ! empty( $def['titre_label'] ) ? $def['titre_label'] : $texte;
}
add_filter( 'enter_title_here', 'kastell_placeholder_titre', 10, 2 );

/** Rappel, en haut de chaque écran, de ce que la rubrique alimente. */
function kastell_aide_en_tete() {
	$ecran = get_current_screen();
	if ( ! $ecran ) {
		return;
	}
	$def = kastell_definition( $ecran->post_type );
	if ( ! $def || empty( $def['aide'] ) ) {
		return;
	}
	printf( '<div class="notice notice-info inline kastell-aide"><p>%s</p></div>', esc_html( $def['aide'] ) );
}
add_action( 'all_admin_notices', 'kastell_aide_en_tete' );

/** Une rubrique unique ne se met pas à la corbeille : le site perdrait sa fiche. */
add_filter( 'map_meta_cap', 'kastell_bloquer_suppression', 10, 4 );

function kastell_bloquer_suppression( $caps, $cap, $user_id, $args ) {
	if ( 'delete_post' !== $cap || empty( $args[0] ) ) {
		return $caps;
	}
	if ( isset( kastell_singletons()[ get_post_type( $args[0] ) ] ) ) {
		return array( 'do_not_allow' );
	}
	return $caps;
}

/* -------------------------------------------------------------------------
 * Listes
 * ---------------------------------------------------------------------- */

/** Colonnes utiles à la place de l'auteur et de la date. */
function kastell_colonnes( $colonnes ) {
	global $typenow;
	$def = kastell_definition( $typenow );
	if ( ! $def || ! isset( $def['liste'] ) ) {
		return $colonnes;
	}

	$nouvelles = array(
		'cb'    => $colonnes['cb'] ?? '',
		'title' => $def['titre_label'] ?? 'Titre',
	);
	foreach ( $def['colonnes'] ?? array() as $cle => $intitule ) {
		$nouvelles[ 'kastell_' . $cle ] = $intitule;
	}
	return $nouvelles;
}
add_filter( 'manage_posts_columns', 'kastell_colonnes' );

function kastell_colonne_contenu( $colonne, $post_id ) {
	if ( 0 !== strpos( $colonne, 'kastell_' ) ) {
		return;
	}
	$cle    = substr( $colonne, strlen( 'kastell_' ) );
	$valeur = get_post_meta( $post_id, KASTELL_PREFIXE . $cle, true );

	if ( '' === $valeur ) {
		echo '<span class="kastell-vide">—</span>';
		return;
	}

	$def   = kastell_definition( get_post_type( $post_id ) );
	$genre = $def['champs'][ $cle ][0] ?? 'texte';

	if ( 'image' === $genre ) {
		printf( '<img src="%s" alt="" class="kastell-vignette" />', esc_url( $valeur ) );
		return;
	}

	/* Une liste stocke un code ; c'est l'intitulé lu dans le formulaire qui
	   doit s'afficher, sans quoi la colonne parle une autre langue que la
	   fiche. */
	if ( 'liste' === $genre ) {
		$options = $def['champs'][ $cle ][3] ?? array();
		echo esc_html( $options[ $valeur ] ?? $valeur );
		return;
	}

	echo esc_html( wp_trim_words( $valeur, 14, '…' ) );
}
add_action( 'manage_posts_custom_column', 'kastell_colonne_contenu', 10, 2 );

/** La liste s'affiche dans l'ordre du site, pas par date de création. */
function kastell_ordre_liste( $requete ) {
	if ( ! is_admin() || ! $requete->is_main_query() ) {
		return;
	}
	if ( ! isset( kastell_collections()[ $requete->get( 'post_type' ) ] ) ) {
		return;
	}
	$requete->set( 'orderby', 'menu_order' );
	$requete->set( 'order', 'ASC' );
	$requete->set( 'posts_per_page', 100 );
}
add_action( 'pre_get_posts', 'kastell_ordre_liste' );

/**
 * Tri par glisser-déposer.
 *
 * Le champ « ordre » de WordPress suppose de comprendre qu'un nombre plus petit
 * remonte, et de renuméroter à la main dès qu'on insère un élément. Déplacer la
 * ligne dit la même chose sans rien à comprendre.
 */
function kastell_enregistrer_ordre() {
	check_ajax_referer( 'kastell_ordre', 'nonce' );

	$ids = isset( $_POST['ids'] ) ? array_map( 'absint', (array) $_POST['ids'] ) : array();
	foreach ( $ids as $rang => $id ) {
		if ( ! $id || ! current_user_can( 'edit_post', $id ) ) {
			continue;
		}
		if ( ! isset( kastell_collections()[ get_post_type( $id ) ] ) ) {
			continue;
		}
		wp_update_post( array( 'ID' => $id, 'menu_order' => $rang + 1 ) );
	}
	wp_send_json_success();
}
add_action( 'wp_ajax_kastell_ordre', 'kastell_enregistrer_ordre' );

/* -------------------------------------------------------------------------
 * Nettoyage
 * ---------------------------------------------------------------------- */

/**
 * On retire les rubriques natives, pour tout le monde.
 *
 * Cette installation ne sert aucune page : « Articles », « Pages » et
 * « Commentaires » n'y produisent rien de visible. Les laisser, c'est offrir
 * d'écrire un article à côté d'« Actualités LinkedIn » et de ne jamais le voir
 * apparaître.
 *
 * Elles étaient jusqu'ici masquées aux seuls éditeurs, ce qui rendait la chose
 * invisible depuis un compte administrateur — la personne qui installe ne
 * pouvait pas vérifier ce qu'elle livrait. Un administrateur garde l'accès par
 * l'URL directe (wp-admin/edit.php) si le besoin s'en présentait.
 */
function kastell_alleger_le_menu() {
	foreach ( array( 'edit.php', 'edit-comments.php', 'index.php' ) as $page ) {
		remove_menu_page( $page );
	}
	remove_menu_page( 'edit.php?post_type=page' );

	if ( ! current_user_can( 'manage_options' ) ) {
		remove_menu_page( 'tools.php' );
	}
}
add_action( 'admin_menu', 'kastell_alleger_le_menu', 999 );

/** Les commentaires n'ont pas de sens sur un back-office sans pages. */
function kastell_sans_commentaires() {
	foreach ( get_post_types() as $type ) {
		if ( post_type_supports( $type, 'comments' ) ) {
			remove_post_type_support( $type, 'comments' );
			remove_post_type_support( $type, 'trackbacks' );
		}
	}
}
add_action( 'init', 'kastell_sans_commentaires', 100 );

function kastell_barre_sans_commentaires( $barre ) {
	$barre->remove_node( 'comments' );
	$barre->remove_node( 'new-post' );
	$barre->remove_node( 'new-page' );
}
add_action( 'admin_bar_menu', 'kastell_barre_sans_commentaires', 999 );

/** Après connexion, on arrive sur le contenu, pas sur le tableau de bord vide. */
function kastell_redirection_connexion( $url, $demande, $utilisateur ) {
	if ( ! $utilisateur instanceof WP_User || ! $utilisateur->has_cap( 'edit_posts' ) ) {
		return $url;
	}
	if ( $utilisateur->has_cap( 'manage_options' ) ) {
		return $url;
	}
	return admin_url( 'admin.php?page=kastell-contenu' );
}
add_filter( 'login_redirect', 'kastell_redirection_connexion', 10, 3 );

/** Mise en forme et script de tri, sur nos écrans seulement. */
function kastell_admin_assets( $hook ) {
	global $typenow;
	$nos_ecrans = kastell_definition( $typenow ) || 'toplevel_page_kastell-contenu' === $hook;
	if ( ! $nos_ecrans ) {
		return;
	}

	wp_add_inline_style(
		'common',
		'.kastell-chapo{max-width:70ch;font-size:14px}'
		. '.kastell-cartes{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));margin:0 0 34px}'
		. '.kastell-carte{display:block;padding:16px 18px;background:#fff;border:1px solid #dcdcde;border-radius:8px;text-decoration:none;color:#1d2327}'
		. '.kastell-carte:hover{border-color:#2271b1;box-shadow:0 1px 4px rgba(0,0,0,.08)}'
		. '.kastell-carte strong{display:block;margin-bottom:5px;font-size:14px}'
		. '.kastell-carte em{font-style:normal;color:#646970;font-weight:400}'
		. '.kastell-carte span{display:block;color:#50575e;font-size:13px;line-height:1.5}'
		. '.kastell-alerte{padding:2px 16px;margin:0 0 20px;background:#fcf9e8;border-left:4px solid #dba617;max-width:80ch}'
		. '.kastell-alerte pre{padding:10px 12px;background:#fff;border:1px solid #dcdcde;overflow-x:auto}'
		. '.kastell-reglages{margin:0 0 26px}'
		. '.kastell-reglages label{display:block;margin-bottom:5px}'
		. '.kastell-reglages .description{display:block;margin-top:5px}'
		. '.kastell-aide{margin:14px 0 4px;max-width:80ch}'
		. '.kastell-vignette{max-width:110px;max-height:38px;width:auto;height:auto}'
		. '.kastell-vide{color:#a7aaad}'
		. '.kastell-import{padding:6px 16px 12px;margin:18px 0 26px}'
		. '.kastell-import h2{margin:12px 0 6px}'
		. '.kastell-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}'
		. '.kastell-poignee td{cursor:move}'
		. '.kastell-place{outline:2px dashed #2271b1;outline-offset:-2px}'
	);

	if ( isset( kastell_collections()[ $typenow ] ) && 'edit.php' === $hook ) {
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_add_inline_script(
			'jquery-ui-sortable',
			'window.kastellOrdre=' . wp_json_encode(
				array(
					'url'   => admin_url( 'admin-ajax.php' ),
					'nonce' => wp_create_nonce( 'kastell_ordre' ),
				)
			) . ';'
			. <<<'JS'
jQuery(function ($) {
  var corps = $('#the-list');
  if (!corps.length || !$.fn.sortable) return;
  corps.addClass('kastell-poignee').sortable({
    items: '> tr',
    axis: 'y',
    cursor: 'move',
    placeholder: 'kastell-place',
    helper: function (e, ligne) {
      /* Sans cela, les cellules perdent leur largeur pendant le déplacement. */
      ligne.children().each(function () { $(this).width($(this).width()); });
      return ligne;
    },
    update: function () {
      var ids = corps.find('> tr').map(function () {
        return (this.id || '').replace('post-', '');
      }).get();
      $.post(window.kastellOrdre.url, {
        action: 'kastell_ordre',
        nonce: window.kastellOrdre.nonce,
        ids: ids
      });
    }
  });
});
JS
		);
	}
}
add_action( 'admin_enqueue_scripts', 'kastell_admin_assets' );
